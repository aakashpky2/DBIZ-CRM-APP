const supabase = require('../config/supabase');

// Official GST portal constitution options (fallback if table is empty)
const CONSTITUTION_FALLBACK = [
    'Foreign Company',
    'Foreign Limited Liability Partnership',
    'Government Department',
    'Hindu Undivided Family',
    'Limited Liability Partnership',
    'Local Authority',
    'Others',
    'Partnership',
    'Private Limited Company',
    'Proprietorship',
    'Public Limited Company',
    'Public Sector Undertaking',
    'Society/ Club/ Trust/ AOP',
    'Statutory Body',
    'Unlimited Company',
];

// Fallback for user types
const USER_TYPES_FALLBACK = [
    'Taxpayer',
    'Tax Deductor',
    'Tax Collector (e-Commerce)',
    'GST Practitioner',
    'Non Resident Taxable Person',
    'United Nation Body',
    'Consulate or Embassy of Foreign Country',
    'Other Notified Person',
    'Non-Resident Online Services Provider and/or Non-Resident Online Money Gaming Supplier'
];

// Fallback for Indian States/UTs
const STATES_FALLBACK = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
].sort();

// @desc    Get master user types
// @route   GET /api/registration/master-user-types
// @access  Public
exports.getMasterUserTypes = async (req, res, next) => {
    try {
        console.log('Fetching master user types...');
        const { data, error } = await supabase
            .from('master_user_types')
            .select('name')
            .order('name', { ascending: true });

        if (error) {
            console.warn('Supabase Error (using fallback):', error.message);
            return res.status(200).json({
                success: true,
                data: USER_TYPES_FALLBACK,
                source: 'fallback'
            });
        }

        const names = data && data.length > 0
            ? data.map(item => item.name)
            : USER_TYPES_FALLBACK;

        console.log(`Found ${names.length} user types`);
        res.status(200).json({
            success: true,
            data: names,
            source: data && data.length > 0 ? 'database' : 'fallback'
        });
    } catch (err) {
        console.error('Master User Types Fetch Error:', err.message);
        res.status(200).json({
            success: true,
            data: USER_TYPES_FALLBACK,
            source: 'fallback'
        });
    }
};

// @desc    Get master states
// @route   GET /api/registration/master-states
// @access  Public
exports.getMasterStates = async (req, res, next) => {
    try {
        console.log('Fetching master states...');
        const { data, error } = await supabase
            .from('master_states')
            .select('name')
            .order('name', { ascending: true });

        if (error) {
            console.warn('Supabase Error (using fallback):', error.message);
            return res.status(200).json({
                success: true,
                data: STATES_FALLBACK,
                source: 'fallback'
            });
        }

        const names = data && data.length > 0
            ? data.map(item => item.name)
            : STATES_FALLBACK;

        console.log(`Found ${names.length} states`);
        res.status(200).json({
            success: true,
            data: names,
            source: data && data.length > 0 ? 'database' : 'fallback'
        });
    } catch (err) {
        console.error('Master States Fetch Error:', err.message);
        res.status(200).json({
            success: true,
            data: STATES_FALLBACK,
            source: 'fallback'
        });
    }
};

// @desc    Get master constitution types
// @route   GET /api/registration/master-constitution-types
// @access  Public
exports.getMasterConstitutionTypes = async (req, res, next) => {
    try {
        console.log('Fetching master constitution types...');
        const { data, error } = await supabase
            .from('master_constitution_types')
            .select('name')
            .order('name', { ascending: true });

        if (error) {
            console.warn('Supabase Error (using fallback):', error.message);
            // Return hardcoded fallback so the UI never breaks
            return res.status(200).json({
                success: true,
                data: CONSTITUTION_FALLBACK,
                source: 'fallback'
            });
        }

        const names = data && data.length > 0
            ? data.map(item => item.name)
            : CONSTITUTION_FALLBACK;

        console.log(`Found ${names.length} constitution types`);
        res.status(200).json({
            success: true,
            data: names,
            source: data && data.length > 0 ? 'database' : 'fallback'
        });
    } catch (err) {
        console.error('Constitution Types Fetch Error:', err.message);
        // Always return usable data even on hard failure
        res.status(200).json({
            success: true,
            data: CONSTITUTION_FALLBACK,
            source: 'fallback'
        });
    }
};

// Official GST portal reason-to-obtain-registration options (fallback)
const REASON_FALLBACK = [
    'Crossing the Threshold',
    'Inter-State supply',
    'Liability to pay as recipient of goods or services',
    'Transfer / Succession of business',
    'Death of the Proprietor',
    'De-merger',
    'Change in constitution of business',
    'Merger /Amalgamation',
    'E-Commerce Operator',
    'Selling through e-Commerce portal',
    'Voluntary Basis',
    'Input Service Distributor only',
    'Supplies on behalf of other taxable Person',
    'SEZ Unit',
    'SEZ Developer',
    'Others',
    'Corporate Debtor undergoing the Corporate Insolvency Resolution Process with IRP/RP',
];

// @desc    Get master reason types for registration
// @route   GET /api/registration/master-reason-types
// @access  Public
exports.getMasterReasonTypes = async (req, res, next) => {
    try {
        console.log('Fetching master reason types...');
        const { data, error } = await supabase
            .from('master_reason_types')
            .select('name')
            .order('sort_order', { ascending: true });

        if (error) {
            console.warn('Supabase Error (using fallback):', error.message);
            return res.status(200).json({
                success: true,
                data: REASON_FALLBACK,
                source: 'fallback'
            });
        }

        const names = data && data.length > 0
            ? data.map(item => item.name)
            : REASON_FALLBACK;

        console.log(`Found ${names.length} reason types`);
        res.status(200).json({
            success: true,
            data: names,
            source: data && data.length > 0 ? 'database' : 'fallback'
        });
    } catch (err) {
        console.error('Reason Types Fetch Error:', err.message);
        res.status(200).json({
            success: true,
            data: REASON_FALLBACK,
            source: 'fallback'
        });
    }
};

// Official GST portal registration type options (fallback)
const REGISTRATION_TYPE_FALLBACK = [
    'GSTIN',
    'Temporary ID',
    'Registration Number under Value Added Tax (TIN)',
    'Central Sales Tax Registration Number',
    'Central Excise Registration Number',
    'Service Tax Registration Number',
    'Importer/Exporter Code Number',
    'Entry Tax Registration Number',
    'Entertainment Tax Registration Number',
    'Hotel And Luxury Tax Registration Number',
    'Corporate Identity Number / Foreign Company Registration Number',
    'Limited Liability Partnership / Foreign Limited Liability Partnership Identification Number',
    'Registration number under Medicinal and Toilet Preparations (Excise Duties) Act',
    'Registration under Shops and Establishment Act',
    'Others (Please specify)',
];

// @desc    Get master registration types
// @route   GET /api/registration/master-registration-types
// @access  Public
exports.getMasterRegistrationTypes = async (req, res, next) => {
    try {
        console.log('Fetching master registration types...');
        const { data, error } = await supabase
            .from('master_registration_types')
            .select('name')
            .order('sort_order', { ascending: true });

        if (error) {
            console.warn('Supabase Error (using fallback):', error.message);
            return res.status(200).json({
                success: true,
                data: REGISTRATION_TYPE_FALLBACK,
                source: 'fallback'
            });
        }

        const names = data && data.length > 0
            ? data.map(item => item.name)
            : REGISTRATION_TYPE_FALLBACK;

        console.log(`Found ${names.length} registration types`);
        res.status(200).json({
            success: true,
            data: names,
            source: data && data.length > 0 ? 'database' : 'fallback'
        });
    } catch (err) {
        console.error('Registration Types Fetch Error:', err.message);
        res.status(200).json({
            success: true,
            data: REGISTRATION_TYPE_FALLBACK,
            source: 'fallback'
        });
    }
};
