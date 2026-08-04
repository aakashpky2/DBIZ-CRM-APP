import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import AddressMap from '../components/AddressMap';
import { useFormSave } from '../hooks/useFormSave';
import './PromoterPartners.css'; // shared section/field styles
import './AuthorizedSignatory.css';

const PROOF_OPTIONS = [
    'Select',
    'Letter of Authorisation',
    'Copy of Resolution passed by BoD / Managing Committee',
    'Any other proof (Specify)',
];

const AuthorizedSignatory = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('AuthorizedSignatory', '/authorized-representative');

    const [primarySignatory, setPrimarySignatory] = useState(false);

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
        // Documents
        photo: null,
        proofType: '',
        proofFile: null,
    });

    const [photoError, setPhotoError] = useState('');
    const photoInputRef = useRef(null);

    const MAX_PHOTO_KB = 100;

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhotoError('');

        if (!file) return;

        // Validate JPEG type
        if (file.type !== 'image/jpeg') {
            setPhotoError('Only JPEG (JPG) files are accepted.');
            toast.error('Only JPEG file format is allowed.');
            e.target.value = '';
            return;
        }

        // Validate size (100 KB = 100 * 1024 bytes)
        if (file.size > MAX_PHOTO_KB * 1024) {
            const sizeKB = (file.size / 1024).toFixed(1);
            setPhotoError(`File is too large (${sizeKB} KB). Maximum allowed is ${MAX_PHOTO_KB} KB.`);
            toast.error(`File size exceeds ${MAX_PHOTO_KB} KB. Please choose a smaller image.`);
            e.target.value = '';
            return;
        }

        setForm(prev => ({ ...prev, photo: file }));
    };

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

    const resetAddress = () => {
        setForm(prev => ({
            ...prev,
            pinCode: '', state: '', district: '', city: '',
            locality: '', road: '', premises: '', buildingNo: '',
            floorNo: '', landmark: '',
        }));
    };

    const addressQuery = useMemo(() => {
        return [form.buildingNo, form.road, form.locality, form.city,
        form.district, form.pinCode, form.state, form.country]
            .filter(Boolean).join(', ');
    }, [form.buildingNo, form.road, form.locality, form.city,
    form.district, form.pinCode, form.state, form.country]);

    const handleMapPick = ({ address: addr }) => {
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

    const removePhoto = () => {
        setForm(prev => ({ ...prev, photo: null }));
        setPhotoError('');
        if (photoInputRef.current) photoInputRef.current.value = '';
    };

    return (
        <RegistrationTabPage activeIndex={2} breadcrumb="Authorized Signatory">
            <Toaster position="top-right" />

            <h2 className="bd-section-title" style={{ marginBottom: '6px' }}>
                Details of Authorized Signatory
            </h2>

            {/* Primary Authorized Signatory checkbox */}
            <label className="as-primary-check">
                <input
                    type="checkbox"
                    checked={primarySignatory}
                    onChange={e => setPrimarySignatory(e.target.checked)}
                />
                <input
                    type="checkbox"
                    name="primarySignatory"
                    checked={primarySignatory}
                    onChange={e => setPrimarySignatory(e.target.checked)}
                    style={{ display: 'none' }}
                />
                Primary Authorized Signatory
            </label>

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

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
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

                <div className="bd-form-row" style={{ padding: '10px 16px' }}>
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

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">Designation / Status <span className="red-dot">*</span></label>
                        <input className="bd-input" name="designation" value={form.designation} onChange={handleChange} placeholder="Enter Designation" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Director Identification Number</label>
                        <input className="bd-input" name="din" value={form.din} onChange={handleChange} placeholder="Enter DIN Number" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Are you a citizen/resident of India?</label>
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

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">Permanent Account Number (PAN) <span className="red-dot">*</span></label>
                        <input className="bd-input" name="pan" value={form.pan} onChange={handleChange}
                            placeholder="Enter Permanent Account Number (PAN)" maxLength={10}
                            style={{ textTransform: 'uppercase' }} />
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

                {/* Live map */}
                <div style={{ margin: '0 16px 12px' }}>
                    <AddressMap address={addressQuery} onPick={handleMapPick} />
                </div>

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
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

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
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

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
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

                <div className="bd-form-row" style={{ padding: '10px 16px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">Floor No. ⓘ</label>
                        <input className="bd-input" name="floorNo" value={form.floorNo} onChange={handleChange} placeholder="Enter Floor No." />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Nearby Landmark ⓘ</label>
                        <input className="bd-input" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Enter Nearby Landmark" />
                    </div>
                </div>

                <div style={{ textAlign: 'center', margin: '12px 0 16px' }}>
                    <button className="pp-reset-btn" onClick={resetAddress}>⟳ RESET ADDRESS</button>
                </div>
            </div>

            {/* ── Document Upload ──────────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">📁</span> Document Upload
                </div>

                <div style={{ padding: '14px 16px' }}>
                    {/* Photo thumbnail + DELETE */}
                    <div className="as-photo-row">
                        {form.photo ? (
                            <div className="as-photo-thumb">
                                <img src={URL.createObjectURL(form.photo)} alt="Photo" />
                                <span className="as-photo-label">Photo</span>
                                <button className="as-delete-btn" onClick={removePhoto}>🗑 DELETE</button>
                            </div>
                        ) : (
                            <div className="as-photo-empty">
                                <div className="as-photo-icon">
                                    <svg viewBox="0 0 40 36" width="40" height="36" fill="none" stroke="#4a90d9" strokeWidth="1.5">
                                        <rect x="1" y="5" width="38" height="30" rx="2" />
                                        <path d="M1 12h38" />
                                        <rect x="4" y="8" width="6" height="2" rx="1" fill="#4a90d9" />
                                        <circle cx="20" cy="23" r="6" />
                                    </svg>
                                </div>
                                <span className="as-photo-label" style={{ color: '#4a90d9' }}>Photo</span>
                            </div>
                        )}
                    </div>

                    {/* Upload photograph */}
                    <div className="as-upload-block">
                        <label className="bd-label">
                            Upload Photograph <span style={{ fontSize: 12, color: '#718096' }}>(of person whose information has been given above)</span>
                            <span className="red-dot"> *</span>
                        </label>
                        <p className="pp-upload-hint">ⓘ Only JPEG file format is allowed</p>
                        <p className="pp-upload-hint">ⓘ Maximum file size for upload is 100 KB</p>
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept=".jpg,.jpeg,image/jpeg"
                            onChange={handlePhotoChange}
                            style={{ marginTop: 8 }}
                        />
                        {photoError && (
                            <div className="as-file-error">
                                ⚠️ {photoError}
                            </div>
                        )}
                    </div>

                    <div className="bd-form-divider" style={{ margin: '16px 0' }} />

                    {/* Proof of details dropdown */}
                    <div className="bd-form-group" style={{ maxWidth: 420 }}>
                        <label className="bd-label">
                            Proof of details of authorized signatory <span className="red-dot">*</span>
                        </label>
                        <select className="bd-select" name="proofType" value={form.proofType} onChange={handleChange}>
                            {PROOF_OPTIONS.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                        </select>
                    </div>
                    <p className="pp-upload-hint" style={{ marginTop: 6 }}>ⓘ File with PDF or JPEG format is only allowed.</p>
                    <p className="pp-upload-hint">ⓘ Maximum file size for upload is 1 MB</p>
                    <input type="file" name="proofFile" accept=".pdf,image/jpeg" onChange={handleChange} style={{ marginTop: 8 }} />

                    {/* Proprietor note */}
                    <div className="as-proof-note">
                        Proof of Authorized signatory is not required for proprietor who is also an authorized signatory.
                    </div>
                </div>
            </div>

            <div className="pp-actions">
                <button className="bd-back-btn" onClick={() => navigate('/promoter-partners')}>BACK</button>
                <button className="pp-list-btn">SHOW LIST</button>
                <button className="pp-add-btn">ADD NEW</button>
                <button className="bd-save-btn" onClick={handleSaveAndContinue} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>

        </RegistrationTabPage>
    );
};

export default AuthorizedSignatory;
