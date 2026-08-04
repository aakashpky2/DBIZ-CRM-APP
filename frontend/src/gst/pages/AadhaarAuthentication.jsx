import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import { useFormSave } from '../hooks/useFormSave';

const AadhaarAuthentication = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('AadhaarAuthentication', '/verification');
    const [optOut, setOptOut] = useState(false); // Default "Yes" as in image

    return (
        <RegistrationTabPage activeIndex={8} breadcrumb="Aadhaar Authentication">
            <Toaster position="top-right" />
            <h2 className="bd-section-title">Aadhaar Authentication</h2>

            <div className="aa-toggle-section">
                <span className="aa-toggle-question">
                    Do you want to opt for Aadhaar Authentication of details of Promoter/Partner, Primary Authorized Signatory added by you?<span className="red-dot">*</span>
                </span>
                <div className="bd-toggle-group">
                    <div
                        className={`bd-toggle ${!optOut ? 'on' : ''}`}
                        onClick={() => setOptOut(prev => !prev)}
                    >
                        <input
                            type="checkbox"
                            name="optForAuth"
                            checked={!optOut}
                            onChange={e => setOptOut(!e.target.checked)}
                            style={{ display: 'none' }}
                        />
                        <div className="bd-toggle-knob" />
                    </div>
                    <span className="bd-toggle-label">{!optOut ? 'Yes' : 'No'}</span>
                </div>
            </div>

            <ul className="aa-instructions">
                <li>1. Authentication request shall be shared on mobile number, email upon submission of application of Promotor/Partner, and Primary Authorized Signatory which are selected.</li>
                <li>2. ARN would be generated once Aadhaar Authentication exercise is completed for all applicable persons whose name are selected in this table.</li>
                <li>3. Kindly select one person from Promotor/Partner for Aadhaar Authentication.</li>
            </ul>

            <div className="aa-table-container">
                <table className="aa-table">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Sl No</th>
                            <th>Name</th>
                            <th>Citizen/ Resident<br />of India</th>
                            <th>Promoter/<br />Partner</th>
                            <th>Primary Authorized<br />Signatory</th>
                            <th>Designation</th>
                            <th>Email<br />Address</th>
                            <th>Mobile<br />Number</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <input type="checkbox" defaultChecked />
                            </td>
                            <td>1</td>
                            <td style={{ color: '#2b6cb0' }}>AKASH P KY</td>
                            <td>Yes</td>
                            <td>Yes</td>
                            <td>Yes</td>
                            <td>Proprietor</td>
                            <td>aakashpky09@gmail.com</td>
                            <td>9746400331</td>
                            <td>—</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="aa-note">
                Note: Please make sure that Email ID and Mobile Number of Promoter/Partners, Primary Authorized Signatory provided by you are correct. The Aadhaar validation link/intimation for Biometric shall be forwarded on the Email ID/Mobile Number provided by you.
            </div>

            <div className="bd-actions">
                <button className="bd-back-btn" onClick={() => navigate('/state-specific-information')}>BACK</button>
                <button className="bd-save-btn" onClick={handleSaveAndContinue} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>
        </RegistrationTabPage>
    );
};

export default AadhaarAuthentication;
