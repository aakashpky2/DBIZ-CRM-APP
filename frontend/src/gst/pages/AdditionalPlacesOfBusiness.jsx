import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import AddressMap from '../components/AddressMap';
import { useFormSave } from '../hooks/useFormSave';

const POSSESSION_OPTIONS = ['Select', 'Own', 'Leased', 'Rented', 'Consent', 'Shared', 'Others'];
const BUSINESS_ACTIVITIES = [
    'Bonded Warehouse', 'EOU / STP / EHTP', 'Export',
    'Factory / Manufacturing', 'Import', 'Supplier of Services',
    'Leasing Business', 'Office / Sale Office', 'Recipient of Goods or Services',
    'Retail Business', 'Warehouse / Depot', 'Wholesale Business',
    'Works Contract', 'Others (Please Specify)',
];

const AdditionalPlacesOfBusiness = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('AdditionalPlacesOfBusiness', '/goods-and-services');
    const [hasAdditional, setHasAdditional] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [numPlaces, setNumPlaces] = useState('');

    const [form, setForm] = useState({
        pinCode: '', state: '', district: '',
        city: '', locality: '', road: '',
        premises: '', buildingNo: '', floorNo: '',
        landmark: '', latitude: '', longitude: '',
        email: '', stdTel: '', telephone: '', mobile: '',
        stdFax: '', fax: '',
        possession: '', proofType: '', proofFile: null,
        activities: [],
    });

    useEffect(() => {
        const val = localStorage.getItem('gst_has_additional_place');
        if (val === 'true') {
            setHasAdditional(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setForm(prev => ({
                ...prev,
                activities: checked
                    ? [...prev.activities, value]
                    : prev.activities.filter(a => a !== value),
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
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

    const resetAddress = () => {
        setForm(prev => ({
            ...prev,
            pinCode: '', state: '', district: '',
            city: '', locality: '', road: '',
            premises: '', buildingNo: '', floorNo: '',
            landmark: '', latitude: '', longitude: '',
        }));
    };

    return (
        <RegistrationTabPage activeIndex={5} breadcrumb="Additional Places of Business">
            <Toaster position="top-right" />
            <h2 className="bd-section-title">Details of Additional Places of your Business</h2>

            {!hasAdditional ? (
                <>
                    <div className="ap-warning-box">
                        <span className="ap-warning-title"><span className="bd-info-icon">ⓘ</span> Important! If you need to add details on additional places of business:</span>
                        <ul className="ap-warning-list">
                            <li>1. Go to <strong>Principal Place of Business</strong> tab.</li>
                            <li>2. Select <strong>Yes</strong> for <strong>Have Additional Places of Business</strong>.</li>
                        </ul>
                    </div>

                    <div className="ap-btn-row">
                        <button className="ap-btn-back" onClick={() => navigate('/principal-place-of-business')}>BACK</button>
                        <button className="ap-btn-add" disabled>ADD NEW</button>
                        <button className="ap-btn-continue" onClick={() => navigate('/goods-and-services')}>CONTINUE</button>
                    </div>
                </>
            ) : !isAdding ? (
                <>
                    <div className="ap-num-places-row">
                        <div className="bd-form-group" style={{ maxWidth: '300px' }}>
                            <label className="bd-label">Number of additional places <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="numPlaces"
                                className="bd-input"
                                value={numPlaces}
                                onChange={(e) => setNumPlaces(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    </div>

                    <div className="ap-warning-box no-records">
                        No records added for Additional Place of Business. Add at least one record to proceed.
                    </div>

                    <div className="ap-btn-row">
                        <button className="ap-btn-back-outlined" onClick={() => navigate('/principal-place-of-business')}>BACK</button>
                        <button className="ap-btn-add-primary" onClick={() => setIsAdding(true)}>ADD NEW</button>
                        <button className="ap-btn-continue-disabled" disabled>CONTINUE</button>
                    </div>
                </>
            ) : (
                <div className="ap-form-container">
                    <p className="bd-mandatory-note" style={{ color: '#e53e3e', marginBottom: '8px' }}>● indicates mandatory fields</p>

                    <div className="pp-address-note" style={{ marginBottom: 16 }}>
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

                    {/* ── Address ──────────────────────────────────────── */}
                    <div className="pp-section">
                        <div className="pp-section-title">
                            <span className="pp-sec-icon">✉️</span> Address
                        </div>
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
                                <input className="bd-input" name="state" value={form.state} onChange={handleChange} placeholder="Kerala" />
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

                        <div style={{ textAlign: 'center', margin: '14px 0' }}>
                            <button className="pp-reset-btn" onClick={resetAddress}>⟳ RESET ADDRESS</button>
                        </div>
                    </div>

                    {/* ── Contact Information ──────────────────────────── */}
                    <div className="pp-section">
                        <div className="pp-section-title">
                            <span className="pp-sec-icon">🪪</span> Contact Information
                        </div>
                        <div className="bd-form-row three-col" style={{ padding: '12px 16px' }}>
                            <div className="bd-form-group">
                                <label className="bd-label">Office Email Address</label>
                                <input type="email" className="bd-input" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email Address" />
                            </div>
                            <div className="bd-form-group">
                                <label className="bd-label">Office Telephone Number (with STD Code)</label>
                                <div className="pp-mobile-row">
                                    <input className="bd-input pp-std" name="stdTel" value={form.stdTel} onChange={handleChange} placeholder="STD" />
                                    <input className="bd-input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Enter Telephone Number" />
                                </div>
                            </div>
                            <div className="bd-form-group">
                                <label className="bd-label">Mobile Number <span className="red-dot">*</span></label>
                                <div className="pp-mobile-row">
                                    <span className="pp-country-code">+91</span>
                                    <input className="bd-input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter Mobile Number" maxLength={10} />
                                </div>
                            </div>
                        </div>
                        <div className="bd-form-row" style={{ padding: '0 16px 14px' }}>
                            <div className="bd-form-group" style={{ maxWidth: 280 }}>
                                <label className="bd-label">Office FAX Number (with STD Code)</label>
                                <div className="pp-mobile-row">
                                    <input className="bd-input pp-std" name="stdFax" value={form.stdFax} onChange={handleChange} placeholder="STD" />
                                    <input className="bd-input" name="fax" value={form.fax} onChange={handleChange} placeholder="Enter Fax Number" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nature of Possession and Document Upload */}
                    <p style={{ margin: '15px 5%', fontSize: '13px', color: '#4a5568' }}>
                        <span className="bd-info-icon">ⓘ</span> In case you need to upload multiple documents, kindly append all the documents to be uploaded as single file and choose 'Others' value from 'Nature of possession of premises' dropdown and select 'Legal Ownership document' value as Proof of Additional Place of Business and upload it.
                    </p>

                    <div className="ppb-two-col-section">
                        <div className="pp-section ppb-half">
                            <div className="pp-section-title">Nature of possession of premises <span className="red-dot">*</span></div>
                            <div style={{ padding: '14px 16px' }}>
                                <select className="bd-select" name="possession" value={form.possession} onChange={handleChange} style={{ width: '100%' }}>
                                    {POSSESSION_OPTIONS.map(o => <option key={o} value={o === 'Select' ? '' : o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="pp-section ppb-half">
                            <div className="pp-section-title">
                                <span className="pp-sec-icon">📁</span> Document Upload <span className="red-dot">*</span>
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                                <label className="bd-label">Proof of Additional Place of Business <span className="red-dot">*</span></label>
                                <select
                                    className="bd-select"
                                    name="proofType"
                                    value={form.proofType}
                                    onChange={handleChange}
                                    style={{ width: '100%', marginBottom: '8px' }}
                                >
                                    <option value="">Select</option>
                                    <option value="Electricity Bill">Electricity Bill</option>
                                    <option value="Legal ownership document">Legal ownership document</option>
                                    <option value="Municipal Khata Copy">Municipal Khata Copy</option>
                                    <option value="Property Tax Receipt">Property Tax Receipt</option>
                                    <option value="Rent / Lease agreement">Rent / Lease agreement</option>
                                    <option value="NOC">Consent Letter / NOC</option>
                                </select>
                                <p className="pp-upload-hint">ⓘ File with PDF or JPEG format is only allowed.</p>
                                <p className="pp-upload-hint">ⓘ Maximum file size for upload is 1 MB</p>
                                <input
                                    type="file"
                                    name="proofFile"
                                    onChange={handleChange}
                                    style={{ marginTop: '8px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nature of Business Activity */}
                    <div className="pp-section">
                        <div className="pp-section-title">Nature of Business Activity being carried out at above mentioned premises <span className="red-dot">*</span></div>
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
                    </div>

                    <div className="bd-actions">
                        <button className="bd-back-btn" onClick={() => setIsAdding(false)}>BACK</button>
                        <button className="pp-list-btn">SHOW LIST</button>
                        <button className="pp-add-btn">ADD NEW</button>
                        <button className="bd-save-btn" onClick={(e) => handleSaveAndContinue(e, form)} disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                        </button>
                    </div>
                </div>
            )}
        </RegistrationTabPage>
    );
};

export default AdditionalPlacesOfBusiness;
