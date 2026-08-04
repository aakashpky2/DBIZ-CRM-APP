import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import { useFormSave } from '../hooks/useFormSave';

const StateSpecificInformation = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('StateSpecificInformation', '/aadhaar-authentication');

    const [form, setForm] = useState({
        ptEcNo: '',
        ptRcNo: '',
        exciseLicenseNo: '',
        exciseLicenseName: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <RegistrationTabPage activeIndex={7} breadcrumb="State Specific Information">
            <Toaster position="top-right" />
            <h2 className="bd-section-title">State Specific Information</h2>

            <div className="bd-form-divider" />

            <div className="bd-form-row two-col">
                <div className="bd-form-group">
                    <label className="bd-label">Professional Tax Employee Code (EC) No.</label>
                    <input
                        type="text"
                        name="ptEcNo"
                        className="bd-input"
                        value={form.ptEcNo}
                        onChange={handleChange}
                        placeholder="Enter Professions Tax E.C Number"
                    />
                </div>
                <div className="bd-form-group">
                    <label className="bd-label">Professional Tax Registration Certificate (RC) No.</label>
                    <input
                        type="text"
                        name="ptRcNo"
                        className="bd-input"
                        value={form.ptRcNo}
                        onChange={handleChange}
                        placeholder="Enter Professions Tax R.C Number"
                    />
                </div>
            </div>

            <div className="bd-form-row two-col">
                <div className="bd-form-group">
                    <label className="bd-label">State Excise License No.</label>
                    <input
                        type="text"
                        name="exciseLicenseNo"
                        className="bd-input"
                        value={form.exciseLicenseNo}
                        onChange={handleChange}
                        placeholder="Enter State Excise License Number"
                    />
                </div>
                <div className="bd-form-group">
                    <label className="bd-label">Name of the person in whose name Excise License is held</label>
                    <input
                        type="text"
                        name="exciseLicenseName"
                        className="bd-input"
                        value={form.exciseLicenseName}
                        onChange={handleChange}
                        placeholder="Enter Name of the Person In whose name Excise License is held"
                    />
                </div>
            </div>

            <div className="bd-actions" style={{ marginTop: '40px' }}>
                <button className="bd-back-btn" onClick={() => navigate('/goods-and-services')}>BACK</button>
                <button className="bd-save-btn" onClick={handleSaveAndContinue} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>
        </RegistrationTabPage>
    );
};

export default StateSpecificInformation;
