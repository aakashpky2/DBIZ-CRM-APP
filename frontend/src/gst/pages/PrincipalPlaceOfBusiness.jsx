import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import AddressMap from '../components/AddressMap';
import { useFormSave } from '../hooks/useFormSave';
import './PromoterPartners.css';
import './PrincipalPlaceOfBusiness.css';

const SECTOR_OPTIONS = ['Select', 'Circle 1', 'Circle 2', 'Circle 3', 'Ward 1', 'Ward 2', 'Charge 1'];
const COMMISSIONERATE = ['Select', 'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'];
const DIVISION_OPTIONS = ['Select', 'Division I', 'Division II', 'Division III'];
const RANGE_OPTIONS = ['Select', 'Range I', 'Range II', 'Range III'];
const POSSESSION_OPTIONS = ['Select', 'Own', 'Leased', 'Rented', 'Consent', 'Shared', 'Others'];

// Proof options change based on the possession type (matches GST portal exactly)
const PROOF_BY_POSSESSION = {
    'Own': [
        'Electricity Bill',
        'Legal ownership document',
        'Municipal Khata Copy',
        'Property Tax Receipt',
    ],
    'Leased': [
        'Electricity Bill',
        'Legal ownership document',
        'Municipal Khata Copy',
        'Property Tax Receipt',
        'Rent / Lease agreement',
        'Rent receipt with NOC (In case of no/expired agreement)',
    ],
    'Rented': [
        'Electricity Bill',
        'Legal ownership document',
        'Municipal Khata Copy',
        'Property Tax Receipt',
        'Rent / Lease agreement',
        'Rent receipt with NOC (In case of no/expired agreement)',
    ],
    'Consent': [
        'Consent Letter',
        'Electricity Bill',
        'Legal ownership document',
        'Municipal Khata Copy',
        'Property Tax Receipt',
    ],
    'Shared': [
        'Consent Letter',
        'Electricity Bill',
        'Legal ownership document',
        'Municipal Khata Copy',
        'Property Tax Receipt',
        'Rent / Lease agreement',
    ],
    'Others': [
        'Legal ownership document',
    ],
};

const BUSINESS_ACTIVITIES = [
    'Bonded Warehouse', 'EOU / STP / EHTP', 'Export',
    'Factory / Manufacturing', 'Import', 'Supplier of Services',
    'Leasing Business', 'Office / Sale Office', 'Recipient of Goods or Services',
    'Retail Business', 'Warehouse / Depot', 'Wholesale Business',
    'Works Contract', 'Others (Please Specify)',
];

const PrincipalPlaceOfBusiness = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('PrincipalPlaceOfBusiness', '/additional-places-of-business');
    const proofInputRef = useRef(null);

    const [form, setForm] = useState({
        // Address
        pinCode: '', state: '', district: '',
        city: '', locality: '', road: '',
        premises: '', buildingNo: '', floorNo: '',
        landmark: '', latitude: '', longitude: '',
        // Jurisdiction
        sector: '', commissionerate: '', division: '', range: '',
        // Contact
        email: '', stdTel: '', telephone: '', mobile: '',
        stdFax: '', fax: '',
        // Possession & Document
        possession: '', proofType: '', proofFile: null,
        // Business activities (checkbox set)
        activities: [],
        // Additional place toggle
        hasAdditional: false,
    });

    const [proofError, setProofError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && name === 'activities') {
            setForm(prev => ({
                ...prev,
                activities: checked
                    ? [...prev.activities, value]
                    : prev.activities.filter(a => a !== value),
            }));
        } else if (type === 'checkbox') {
            setForm(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'possession') {
            // Reset proof type whenever possession changes
            setForm(prev => ({ ...prev, possession: value, proofType: '' }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Derive proof options from current possession
    const proofOptions = form.possession ? (PROOF_BY_POSSESSION[form.possession] || []) : [];

    const handleProofFile = (e) => {
        const file = e.target.files[0];
        setProofError('');
        if (!file) return;
        const allowed = ['application/pdf', 'image/jpeg'];
        if (!allowed.includes(file.type)) {
            setProofError('Only PDF or JPEG files are allowed.');
            toast.error('Only PDF or JPEG file format is allowed.');
            e.target.value = '';
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            setProofError(`File too large (${(file.size / 1024).toFixed(0)} KB). Max is 1 MB.`);
            toast.error('File size exceeds 1 MB.');
            e.target.value = '';
            return;
        }
        setForm(prev => ({ ...prev, proofFile: file }));
    };

    const resetAddress = () => {
        setForm(prev => ({
            ...prev,
            pinCode: '', state: '', district: '',
            city: '', locality: '', road: '',
            premises: '', buildingNo: '', floorNo: '',
            landmark: '', latitude: '', longitude: '',
        }));
    };

    const addressQuery = useMemo(() =>
        [form.buildingNo, form.road, form.locality, form.city,
        form.district, form.pinCode, form.state, 'India']
            .filter(Boolean).join(', '),
        [form.buildingNo, form.road, form.locality, form.city,
        form.district, form.pinCode, form.state]);

    const handleMapPick = ({ lat, lon, address: addr }) => {
        setForm(prev => ({
            ...prev,
            state: addr?.state ?? prev.state,
            district: addr?.county ?? addr?.state_district ?? prev.district,
            city: addr?.city ?? addr?.town ?? addr?.village ?? prev.city,
            locality: addr?.suburb ?? addr?.neighbourhood ?? prev.locality,
            road: addr?.road ?? prev.road,
            pinCode: addr?.postcode ?? prev.pinCode,
            latitude: lat ? lat.toFixed(6) : prev.latitude,
            longitude: lon ? lon.toFixed(6) : prev.longitude,
        }));
    };

    return (
        <RegistrationTabPage activeIndex={4} breadcrumb="Principal Place of Business">
            <Toaster position="top-right" />

            <h2 className="bd-section-title" style={{ marginBottom: '8px' }}>
                Details of Principal Place of Business
            </h2>

            {/* Disclaimer */}
            <div className="pp-address-note" style={{ marginBottom: 16, marginTop: 0 }}>
                <em>
                    i. Please be aware that the GST system incorporates mandatory address validations for accuracy and
                    uniformity. These include front-end validations upon entry and back-end cross-checks with GST system geocoding engine.
                </em>
                <br /><br />
                <em>
                    ii. Users must ensure that addresses entered align with these validations and any corresponding address proof.
                    Your adherence helps maintain system integrity. Thank you for your cooperation.
                </em>
            </div>

            {/* ── Address ──────────────────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">✉️</span> Address
                </div>

                {/* Live map — fills lat/lng on marker drag */}
                <div style={{ margin: '0 16px 12px' }}>
                    <AddressMap address={addressQuery} onPick={handleMapPick} />
                </div>

                <div className="bd-form-row three-col" style={{ padding: '10px 16px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">PIN Code <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="pinCode" value={form.pinCode} onChange={handleChange} placeholder="Enter PIN Code" maxLength={6} />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">State ⓘ</label>
                        <input className="bd-input" name="state" value={form.state} onChange={handleChange} placeholder="Enter State" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">District <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="district" value={form.district} onChange={handleChange} placeholder="Enter District Name" />
                    </div>
                </div>

                <div className="bd-form-row three-col" style={{ padding: '0 16px 10px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">City / Town / Village <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="city" value={form.city} onChange={handleChange} placeholder="Enter City / Town / Village" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Locality / Sub Locality ⓘ</label>
                        <input className="bd-input" name="locality" value={form.locality} onChange={handleChange} placeholder="Enter Locality / Sublocality" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Road / Street <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="road" value={form.road} onChange={handleChange} placeholder="Enter Road / Street / Lane" />
                    </div>
                </div>

                <div className="bd-form-row three-col" style={{ padding: '0 16px 10px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">Name of the Premises / Building ⓘ</label>
                        <input className="bd-input" name="premises" value={form.premises} onChange={handleChange} placeholder="Enter Name of Premises / Building" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Building No. / Flat No. <span className="red-dot">*</span> ⓘ</label>
                        <input className="bd-input" name="buildingNo" value={form.buildingNo} onChange={handleChange} placeholder="Enter Building No. / Flat No. / Door No." />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Floor No. ⓘ</label>
                        <input className="bd-input" name="floorNo" value={form.floorNo} onChange={handleChange} placeholder="Enter Floor No." />
                    </div>
                </div>

                <div className="bd-form-row three-col" style={{ padding: '0 16px 10px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">Nearby Landmark ⓘ</label>
                        <input className="bd-input" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Enter Nearby Landmark" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Latitude</label>
                        <input className="bd-input" name="latitude" value={form.latitude} onChange={handleChange} placeholder="Enter Latitude" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Longitude</label>
                        <input className="bd-input" name="longitude" value={form.longitude} onChange={handleChange} placeholder="Enter Longitude" />
                    </div>
                </div>

                <div style={{ textAlign: 'center', margin: '6px 0 14px' }}>
                    <button className="pp-reset-btn" onClick={resetAddress}>⟳ RESET ADDRESS</button>
                </div>

                {/* Jurisdiction row */}
                <div className="ppb-jurisdiction-divider" />
                <div className="bd-form-row" style={{ padding: '14px 16px 0' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">State Jurisdiction</label>
                        <input className="bd-input bd-input-readonly" value={form.state || '—'} readOnly />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Sector / Circle / Ward / Charge / Unit ⓘ <span className="red-dot">*</span></label>
                        <select className="bd-select" name="sector" value={form.sector} onChange={handleChange}>
                            {SECTOR_OPTIONS.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                {/* Center Jurisdiction */}
                <div className="ppb-center-juris" style={{ padding: '12px 16px 4px' }}>
                    <span className="ppb-cj-label">
                        Center Jurisdiction ( ⓘ Refer the{' '}
                        <a href="#" className="ppb-link">link</a> for Center Jurisdiction )
                    </span>
                </div>
                <div className="bd-form-row three-col" style={{ padding: '8px 16px 16px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">Commissionerate <span className="red-dot">*</span></label>
                        <select className="bd-select" name="commissionerate" value={form.commissionerate} onChange={handleChange}>
                            {COMMISSIONERATE.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                        </select>
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Division <span className="red-dot">*</span></label>
                        <select className="bd-select" name="division" value={form.division} onChange={handleChange}>
                            {DIVISION_OPTIONS.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                        </select>
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">Range <span className="red-dot">*</span></label>
                        <select className="bd-select" name="range" value={form.range} onChange={handleChange}>
                            {RANGE_OPTIONS.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Contact Information ──────────────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">🪪</span> Contact Information
                </div>
                <div className="bd-form-row three-col" style={{ padding: '12px 16px' }}>
                    <div className="bd-form-group">
                        <label className="bd-label">🔒 Office Email Address <span className="red-dot">*</span></label>
                        <input type="email" className="bd-input" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email Address" />
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">📞 Office Telephone Number (with STD Code)</label>
                        <div className="pp-mobile-row">
                            <input className="bd-input pp-std" name="stdTel" value={form.stdTel} onChange={handleChange} placeholder="STD" />
                            <input className="bd-input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Enter Telephone Number" />
                        </div>
                    </div>
                    <div className="bd-form-group">
                        <label className="bd-label">📱 Mobile Number <span className="red-dot">*</span></label>
                        <div className="pp-mobile-row">
                            <span className="pp-country-code">+91</span>
                            <input className="bd-input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter Mobile Number" maxLength={10} />
                        </div>
                    </div>
                </div>
                <div className="bd-form-row" style={{ padding: '0 16px 14px' }}>
                    <div className="bd-form-group" style={{ maxWidth: 280 }}>
                        <label className="bd-label">🖨️ Office FAX Number (with STD Code)</label>
                        <div className="pp-mobile-row">
                            <input className="bd-input pp-std" name="stdFax" value={form.stdFax} onChange={handleChange} placeholder="STD" />
                            <input className="bd-input" name="fax" value={form.fax} onChange={handleChange} placeholder="Enter Fax Number" />
                        </div>
                    </div>
                </div>
                <div className="ppb-info-note">
                    ⓘ Make sure the contact details match the authorised signatory's records on the GST Portal.
                </div>
            </div>

            {/* ── Nature of Possession + Document Upload (side by side) ── */}
            <div className="ppb-two-col-section">
                {/* Nature of Possession */}
                <div className="pp-section ppb-half">
                    <div className="pp-section-title">
                        <span className="pp-sec-icon">🏠</span> Nature of possession of premises <span className="red-dot">*</span>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                        <label className="bd-label" style={{ marginBottom: 6, display: 'block' }}>Please Select</label>
                        <select className="bd-select" name="possession" value={form.possession} onChange={handleChange}>
                            {POSSESSION_OPTIONS.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                {/* Document Upload */}
                <div className="pp-section ppb-half">
                    <div className="pp-section-title">
                        <span className="pp-sec-icon">📁</span> Document Upload <span className="red-dot">*</span>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                        <label className="bd-label">Proof of Principal Place of Business <span className="red-dot">*</span></label>
                        <select
                            className="bd-select"
                            name="proofType"
                            value={form.proofType}
                            onChange={handleChange}
                            style={{ marginTop: 6, marginBottom: 8, width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                        >
                            <option value="">Select</option>
                            {proofOptions.map(o => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                        {!form.possession && (
                            <p style={{ fontSize: 12, color: '#e53e3e', margin: '4px 0 8px' }}>
                                ⓘ Please select Nature of Possession first.
                            </p>
                        )}
                        <p className="pp-upload-hint">ⓘ File with PDF or JPEG format is only allowed.</p>
                        <p className="pp-upload-hint">ⓘ Maximum file size for upload is 1 MB</p>
                        <input ref={proofInputRef} type="file" accept=".pdf,.jpg,.jpeg,image/jpeg,application/pdf"
                            onChange={handleProofFile} style={{ marginTop: 8 }} />
                        {proofError && <div className="as-file-error">⚠️ {proofError}</div>}
                    </div>
                </div>
            </div>

            {/* ── Nature of Business Activity ───────────────────── */}
            <div className="pp-section">
                <div className="pp-section-title">
                    <span className="pp-sec-icon">🚚</span>
                    Nature of Business Activity being carried out at above mentioned premises <span className="red-dot">*</span>
                </div>
                <div className="ppb-activity-grid">
                    {BUSINESS_ACTIVITIES.map(act => (
                        <label key={act} className="ppb-activity-item">
                            <input
                                type="checkbox"
                                name="activities"
                                value={act}
                                checked={form.activities.includes(act)}
                                onChange={handleChange}
                            />
                            <span>{act}</span>
                        </label>
                    ))}
                </div>

                {/* Have Additional Place of Business toggle */}
                <div className="ppb-additional-row">
                    <span className="bd-label" style={{ marginRight: 12 }}>Have Additional Place of Business</span>
                    <div
                        className={`bd-toggle ${form.hasAdditional ? 'on' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, hasAdditional: !prev.hasAdditional }))}
                    >
                        <div className="bd-toggle-knob" />
                    </div>
                    <span className="bd-toggle-label">{form.hasAdditional ? 'Yes' : 'No'}</span>
                </div>
            </div>

            <div className="bd-actions">
                <button className="bd-back-btn" onClick={() => navigate('/authorized-representative')}>BACK</button>
                <button className="bd-save-btn" onClick={(e) => {
                    localStorage.setItem('gst_has_additional_place', form.hasAdditional ? 'true' : 'false');
                    handleSaveAndContinue(e, form);
                }} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>

        </RegistrationTabPage>
    );
};

export default PrincipalPlaceOfBusiness;
