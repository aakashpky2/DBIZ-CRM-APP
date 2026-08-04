import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import AddressMap from '../components/AddressMap';
import { useFormSave } from '../hooks/useFormSave';
import './PromoterPartners.css';

const PromoterPartners = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('PromoterPartners', '/authorized-signatory');

    const [form, setForm] = useState({
        // Personal Info
        firstName: '', middleName: '', lastName: '',
        fatherFirstName: '', fatherMiddleName: '', fatherLastName: '',
        dob: '', mobile: '', email: '',
        gender: '',
        stdCode: '', telephone: '',
        // Identity Info
        designation: '', din: '', citizenOfIndia: true,
        pan: '', passport: '', aadhaar: '',
        // Address
        country: 'India', pinCode: '', state: '',
        district: '', city: '', locality: '',
        road: '', premises: '', buildingNo: '',
        floorNo: '', landmark: '',
        // Other
        alsoSignatory: false,
        // Document
        photo: null,
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setForm(prev => ({ ...prev, [name]: files[0] || null }));
        } else if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Build a geocodable address string from the filled fields (debounced inside AddressMap)
    const addressQuery = useMemo(() => {
        const parts = [form.buildingNo, form.road, form.locality, form.city,
        form.district, form.pinCode, form.state, form.country]
            .filter(Boolean);
        return parts.join(', ');
    }, [form.buildingNo, form.road, form.locality, form.city,
    form.district, form.pinCode, form.state, form.country]);

    // Called when user drags the marker — back-fills readable fields
    const handleMapPick = ({ display_name, address: addr }) => {
        setForm(prev => ({
            ...prev,
            state: addr?.state ?? prev.state,
            district: addr?.county ?? addr?.state_district ?? prev.district,
            city: addr?.city ?? addr?.town ?? addr?.village ?? prev.city,
            locality: addr?.suburb ?? addr?.neighbourhood ?? prev.locality,
            road: addr?.road ?? prev.road,
            pinCode: addr?.postcode ?? prev.pinCode,
        }));
    };

    const resetAddress = () => {
        setForm(prev => ({
            ...prev,
            country: 'India', pinCode: '', state: '',
            district: '', city: '', locality: '',
            road: '', premises: '', buildingNo: '',
            floorNo: '', landmark: '',
        }));
    };

    return (
        <RegistrationTabPage activeIndex={1} breadcrumb="Promoter / Partners">
            <Toaster position="top-right" />

            <h2 className="bd-section-title" style={{ marginBottom: '4px' }}>Details of Proprietor</h2>

            {/* ── Personal Information ─────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">👤</span> Personal Information
                </div>

                <div className="pp-field-group">
                    <div className="pp-field-label">Name of Person</div>
                    <div className="bd-form-row three-col">
                        <div className="bd-form-group">
                            <label className="bd-label">First Name <span className="red-dot">*</span></label>
                            <input className="bd-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter First Name" />
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Middle Name</label>
                            <input className="bd-input" name="middleName" value={form.middleName} onChange={handleChange} placeholder="Enter Middle Name" />
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Last Name</label>
                            <input className="bd-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter Last Name" />
                        </div>
                    </div>
                </div>

                <div className="pp-field-group">
                    <div className="pp-field-label">Name of Father</div>
                    <div className="bd-form-row three-col">
                        <div className="bd-form-group">
                            <label className="bd-label">First Name <span className="red-dot">*</span></label>
                            <input className="bd-input" name="fatherFirstName" value={form.fatherFirstName} onChange={handleChange} placeholder="Enter First Name" />
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Middle Name</label>
                            <input className="bd-input" name="fatherMiddleName" value={form.fatherMiddleName} onChange={handleChange} placeholder="Enter Middle Name" />
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Last Name</label>
                            <input className="bd-input" name="fatherLastName" value={form.fatherLastName} onChange={handleChange} placeholder="Enter Last Name" />
                        </div>
                    </div>
                </div>

                <div className="bd-form-row three-col">
                    <div className="bd-form-group">
                        <label className="bd-label">Date of Birth <span className="red-dot">*</span></label>
                        <input type="date" className="bd-input bd-date-input" name="dob" value={form.dob} onChange={handleChange} />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">📱 Mobile Number <span className="red-dot">*</span></label>
                        <div className="pp-mobile-row">
                            <span className="pp-country-code">+91</span>
                            <input className="bd-input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter Mobile Number" maxLength={10} />
                        </div>
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">🔒 Email Address <span className="red-dot">*</span></label>
                        <input type="email" className="bd-input" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email Address" />
                    </div>
                </div>

                <div className="bd-form-row">
                    <div className="bd-form-group">
                        <label className="bd-label">Gender <span className="red-dot">*</span></label>
                        <div className="bd-radio-row">
                            {['Male', 'Female', 'Others'].map(g => (
                                <label key={g} className="bd-radio-label">
                                    <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} /> {g}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">📞 Telephone Number (with STD Code)</label>
                        <div className="pp-mobile-row">
                            <input className="bd-input pp-std" name="stdCode" value={form.stdCode} onChange={handleChange} placeholder="STD" />
                            <input className="bd-input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Enter Telephone Number" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Identity Information ─────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">🪪</span> Identity Information
                </div>

                <div className="bd-form-row three-col">
                    <div className="bd-form-group">
                        <label className="bd-label">Designation / Status <span className="red-dot">*</span></label>
                        <input className="bd-input" name="designation" value={form.designation} onChange={handleChange} placeholder="Enter Designation" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Director Identification Number ⓘ</label>
                        <input className="bd-input" name="din" value={form.din} onChange={handleChange} placeholder="Enter DIN Number" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Are you a citizen of India?</label>
                        <div className="bd-toggle-group" style={{ marginTop: '6px' }}>
                            <div
                                className={`bd-toggle ${form.citizenOfIndia ? 'on' : ''}`}
                                onClick={() => setForm(prev => ({ ...prev, citizenOfIndia: !prev.citizenOfIndia }))}
                            >
                                <input
                                    type="checkbox"
                                    name="citizenOfIndia"
                                    checked={form.citizenOfIndia}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="bd-toggle-knob" />
                            </div>
                            <span className="bd-toggle-label">{form.citizenOfIndia ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>

                <div className="bd-form-row three-col">
                    <div className="bd-form-group">
                        <label className="bd-label">Permanent Account Number (PAN) <span className="red-dot">*</span></label>
                        <input className="bd-input" name="pan" value={form.pan} onChange={handleChange} placeholder="Enter PAN" maxLength={10} style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Passport Number (In case of Foreigner)</label>
                        <input className="bd-input" name="passport" value={form.passport} onChange={handleChange} placeholder="Enter Passport Number" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Aadhaar Number ⓘ</label>
                        <input className="bd-input" name="aadhaar" value={form.aadhaar} onChange={handleChange} placeholder="Enter Aadhaar Number" maxLength={12} />
                    </div>
                </div>
            </div>

            {/* ── Residential Address ──────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">✉️</span> Residential Address
                </div>

                <div className="pp-address-note">
                    <em>
                        i. Please be aware that the GST system incorporates mandatory address validations for accuracy and uniformity.
                        These include front-end validations upon entry and back-end cross-checks with GST system geocoding engine.
                    </em>
                    <br /><br />
                    <em>
                        ii. Users must ensure that addresses entered align with these validations and any corresponding address proof.
                        Your adherence helps maintain system integrity. Thank you for your cooperation.
                    </em>
                </div>

                {/* Live OpenStreetMap */}
                <div style={{ margin: '0 16px 12px' }}>
                    <AddressMap address={addressQuery} onPick={handleMapPick} />
                </div>

                <div className="bd-form-row three-col">
                    <div className="bd-form-group">
                        <label className="bd-label">Country <span className="red-dot">*</span></label>
                        <select className="bd-select" name="country" value={form.country} onChange={handleChange}>
                            <option>India</option>
                        </select>
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">PIN Code <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="pinCode" value={form.pinCode} onChange={handleChange} placeholder="Enter PIN Code" maxLength={6} />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">State <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="state" value={form.state} onChange={handleChange} placeholder="Enter State Name" />
                    </div>
                </div>

                <div className="bd-form-row three-col">
                    <div className="bd-form-group">
                        <label className="bd-label">District <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="district" value={form.district} onChange={handleChange} placeholder="Enter District Name" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">City / Town / Village <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="city" value={form.city} onChange={handleChange} placeholder="Enter City / Town / Village" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Locality / Sub Locality ⓘ</label>
                        <input className="bd-input" name="locality" value={form.locality} onChange={handleChange} placeholder="Enter Locality / Sublocality" />
                    </div>
                </div>

                <div className="bd-form-row three-col">
                    <div className="bd-form-group">
                        <label className="bd-label">Road / Street <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="road" value={form.road} onChange={handleChange} placeholder="Enter Road / Street / Lane" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Name of the Premises / Building ⓘ</label>
                        <input className="bd-input" name="premises" value={form.premises} onChange={handleChange} placeholder="Enter Name of Premises / Building" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Building No. / Flat No. <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="buildingNo" value={form.buildingNo} onChange={handleChange} placeholder="Enter Building No. / Flat No. / Door No." />
                    </div>
                </div>

                <div className="bd-form-row">
                    <div className="bd-form-group">
                        <label className="bd-label">Floor No. ⓘ</label>
                        <input className="bd-input" name="floorNo" value={form.floorNo} onChange={handleChange} placeholder="Enter Floor No." />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Nearby Landmark ⓘ</label>
                        <input className="bd-input" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Enter Nearby Landmark" />
                    </div>
                </div>

                <div style={{ textAlign: 'center', margin: '16px 0 8px' }}>
                    <button className="pp-reset-btn" onClick={resetAddress}>⟳ RESET ADDRESS</button>
                </div>
            </div>

            {/* ── Document Upload ──────────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">📁</span> Document Upload
                </div>

                <div className="pp-upload-row">
                    <div className="pp-upload-left">
                        <label className="bd-label">
                            Upload Photograph (of person whose information has been given above) <span className="red-dot">*</span>
                        </label>
                        <p className="pp-upload-hint">ⓘ Only JPEG file format is allowed</p>
                        <p className="pp-upload-hint">ⓘ Maximum file size for upload is 100 KB</p>
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="file" name="photo" accept="image/jpeg" onChange={handleChange} />
                            <span style={{ color: '#718096', fontSize: '13px' }}>OR</span>
                        </div>
                    </div>
                    <div className="pp-upload-right">
                        <button className="pp-camera-btn">📷 TAKE PICTURE</button>
                        <p className="pp-upload-hint" style={{ marginTop: '8px' }}>
                            ⓘ You can use your device camera to take selfie photograph.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Other Information ───────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title" style={{ borderBottom: 'none', marginBottom: '12px' }}>
                    Other Information
                </div>
                <div className="bd-toggle-group">
                    <label className="bd-label" style={{ marginRight: '12px' }}>Also Authorized Signatory</label>
                    <div
                        className={`bd-toggle ${form.alsoSignatory ? 'on' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, alsoSignatory: !prev.alsoSignatory }))}
                    >
                        <input
                            type="checkbox"
                            name="alsoSignatory"
                            checked={form.alsoSignatory}
                            onChange={handleChange}
                            style={{ display: 'none' }}
                        />
                        <div className="bd-toggle-knob" />
                    </div>
                    <span className="bd-toggle-label">{form.alsoSignatory ? 'Yes' : 'No'}</span>
                </div>
            </div>

            <div className="pp-actions">
                <button className="bd-back-btn" onClick={() => navigate('/business-details')}>BACK</button>
                <button className="pp-list-btn">SHOW LIST</button>
                <button className="pp-add-btn">ADD NEW</button>
                <button className="bd-save-btn" onClick={handleSaveAndContinue} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>

        </RegistrationTabPage>
    );
};

export default PromoterPartners;
