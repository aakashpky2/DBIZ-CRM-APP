CREATE OR REPLACE FUNCTION public.atomic_save_business_details_and_burn(
    p_user_id UUID,
    p_trn TEXT,
    p_payload JSONB,
    p_action_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credit_cost INT;
    v_current_credits INT;
    v_wallet_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Validate Inputs
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'p_user_id is required';
    END IF;
    IF p_trn IS NULL THEN
        RAISE EXCEPTION 'p_trn is required';
    END IF;
    IF p_action_key IS NULL THEN
        RAISE EXCEPTION 'p_action_key is required';
    END IF;

    -- Determine credit cost based on action key
    IF p_action_key = 'reg_started' THEN
        v_credit_cost := 1;
    ELSIF p_action_key = 'reg_business_details' THEN
        v_credit_cost := 1;
    ELSE
        v_credit_cost := 1; -- Default fallback
    END IF;

    -- 2. Lock the credit wallet row and check balance
    SELECT id, remaining_credits INTO v_wallet_id, v_current_credits
    FROM public.student_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'No credit wallet found for user %', p_user_id;
    END IF;

    IF v_current_credits < v_credit_cost THEN
        RAISE EXCEPTION 'INSUFFICIENT_CREDITS: Requires % but only has %', v_credit_cost, v_current_credits;
    END IF;

    -- 3. Deduct credits
    UPDATE public.student_credits
    SET remaining_credits = remaining_credits - v_credit_cost,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- 4. Record the transaction
    INSERT INTO public.credit_transactions (
        user_id, amount, transaction_type, description, created_at
    ) VALUES (
        p_user_id, -v_credit_cost, 'usage', 'Action: ' || p_action_key || ' for TRN: ' || p_trn, NOW()
    );

    -- 5. Persist business_details
    INSERT INTO public.business_details (
        trn,
        legal_name,
        pan,
        state_name,
        district,
        trade_name,
        additional_trade,
        constitution,
        casual_taxable,
        composition,
        rule_14a,
        reason,
        commencement_date,
        liability_date,
        form_tabs_data,
        updated_at
    ) VALUES (
        p_trn,
        p_payload->>'legalName',
        p_payload->>'pan',
        p_payload->>'stateName',
        p_payload->>'district',
        p_payload->>'tradeName',
        p_payload->>'additionalTrade',
        p_payload->>'constitution',
        (p_payload->>'casualTaxable')::BOOLEAN,
        (p_payload->>'composition')::BOOLEAN,
        p_payload->>'rule14A',
        p_payload->>'reason',
        NULLIF(p_payload->>'commencementDate', '')::DATE,
        NULLIF(p_payload->>'liabilityDate', '')::DATE,
        CASE WHEN p_payload ? 'formTabsData' THEN p_payload->'formTabsData' ELSE '{}'::JSONB END,
        NOW()
    )
    ON CONFLICT (trn) DO UPDATE SET
        legal_name = COALESCE(EXCLUDED.legal_name, public.business_details.legal_name),
        pan = COALESCE(EXCLUDED.pan, public.business_details.pan),
        state_name = COALESCE(EXCLUDED.state_name, public.business_details.state_name),
        district = COALESCE(EXCLUDED.district, public.business_details.district),
        trade_name = COALESCE(EXCLUDED.trade_name, public.business_details.trade_name),
        additional_trade = COALESCE(EXCLUDED.additional_trade, public.business_details.additional_trade),
        constitution = COALESCE(EXCLUDED.constitution, public.business_details.constitution),
        casual_taxable = COALESCE(EXCLUDED.casual_taxable, public.business_details.casual_taxable),
        composition = COALESCE(EXCLUDED.composition, public.business_details.composition),
        rule_14a = COALESCE(EXCLUDED.rule_14a, public.business_details.rule_14a),
        reason = COALESCE(EXCLUDED.reason, public.business_details.reason),
        commencement_date = COALESCE(EXCLUDED.commencement_date, public.business_details.commencement_date),
        liability_date = COALESCE(EXCLUDED.liability_date, public.business_details.liability_date),
        form_tabs_data = COALESCE(EXCLUDED.form_tabs_data, public.business_details.form_tabs_data),
        updated_at = NOW();

    -- 6. Return Result
    v_result := jsonb_build_object(
        'success', true,
        'trn', p_trn,
        'credits_burned', v_credit_cost
    );

    RETURN v_result;
END;
$$;
