import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';
import './Dashboard.css';
import './GSTR1B2BAddInvoice.css';

const GSTR2BSectionManager = () => {
    const { secId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    // Form fields state
    const [formData, setFormData] = useState({
        supplierGSTIN: '',
        supplierName: '',
        invoiceNo: '',
        invoiceDate: '',
        taxableValue: '',
        pos: 'Select',
        rate: '18%',
        igst: '',
        cgst: '',
        sgst: '',
        cess: '',
        // ITC Not Avail specifics
        reason: 'Select',
        taxAmount: '',
        // Debit/Credit Note specifics
        debitNoteNo: '',
        creditNoteNo: '',
        noteDate: '',
        // Import specifics
        portCode: '',
        boeNo: '',
        boeDate: '',
        country: ''
    });

    const ratesList = ['0%', '0.1%', '0.25%', '1%', '1.5%', '3%', '5%', '6%', '7.5%', '12%', '18%', '28%', '40%'];
    const reasonsList = [
        'Select',
        'Blocked Credit - Section 17(5)',
        'Personal Consumption supplies',
        'Supplies from Composition Taxpayer',
        'Non-business / Exempt Supplies'
    ];

    const getSectionConfig = () => {
        switch (secId) {
            case 'itc-available':
                return {
                    title: '1. ITC Available',
                    tabName: 'GSTR2B_ITC_Available',
                    fields: ['supplierGSTIN', 'supplierName', 'invoiceNo', 'invoiceDate', 'taxableValue', 'pos', 'rate', 'taxes']
                };
            case 'itc-not-available':
                return {
                    title: '2. ITC Not Available',
                    tabName: 'GSTR2B_ITC_Not_Available',
                    fields: ['supplierGSTIN', 'supplierName', 'reason', 'taxableValue', 'taxAmount']
                };
            case 'debit-notes':
                return {
                    title: '3. Debit Notes (ITC Additions)',
                    tabName: 'GSTR2B_Debit_Notes',
                    fields: ['supplierGSTIN', 'debitNoteNo', 'noteDate', 'taxableValue', 'pos', 'rate', 'taxes']
                };
            case 'credit-notes':
                return {
                    title: '4. Credit Notes (ITC Reductions)',
                    tabName: 'GSTR2B_Credit_Notes',
                    fields: ['supplierGSTIN', 'creditNoteNo', 'noteDate', 'taxableValue', 'pos', 'rate', 'taxes']
                };
            case 'import-goods':
                return {
                    title: '5. Import of Goods (BOEs)',
                    tabName: 'GSTR2B_Import_Goods',
                    fields: ['portCode', 'boeNo', 'boeDate', 'taxableValue', 'rate', 'igst']
                };
            case 'import-services':
                return {
                    title: '6. Import of Services',
                    tabName: 'GSTR2B_Import_Services',
                    fields: ['country', 'supplierName', 'invoiceNo', 'invoiceDate', 'taxableValue', 'rate', 'igst']
                };
            default:
                return { title: 'Unknown Section', tabName: 'GSTR2B_Unknown', fields: [] };
        }
    };

    const config = getSectionConfig();

    useEffect(() => {
        const fetchRecords = async () => {
            setLoading(true);
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/tab/${trn}/${config.tabName}`);
                if (res.data.success && res.data.data) {
                    const loaded = res.data.data.records || res.data.data.invoices || res.data.data || [];
                    setRecords(Array.isArray(loaded) ? loaded : []);
                } else {
                    setRecords([]);
                }
            } catch (err) {
                console.error("Failed to load records:", err);
                toast.error("Failed to load section records");
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [secId]);

    // Handle standard inputs change
    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        // Instant Auto-calculation of taxes if key inputs change
        if (['taxableValue', 'pos', 'rate'].includes(name)) {
            const val = parseFloat(updatedData.taxableValue) || 0;
            const rateVal = parseFloat(updatedData.rate.replace('%', '')) || 0;

            if (val > 0) {
                const homeState = (localStorage.getItem('gst_state') || 'Kerala').toLowerCase();
                const selectedPos = updatedData.pos || 'Select';

                const isKerala = selectedPos.toLowerCase().includes('kerala') || selectedPos.toLowerCase().includes('32');
                const isLocal = selectedPos === 'Select' ? true : isKerala;

                if (isLocal) {
                    // Intra-state split CGST & SGST
                    const halfTax = (val * (rateVal / 2)) / 100;
                    updatedData.cgst = halfTax.toFixed(2);
                    updatedData.sgst = halfTax.toFixed(2);
                    updatedData.igst = '0.00';
                } else {
                    // Inter-state IGST
                    const igstTax = (val * rateVal) / 100;
                    updatedData.igst = igstTax.toFixed(2);
                    updatedData.cgst = '0.00';
                    updatedData.sgst = '0.00';
                }
                
                updatedData.taxAmount = ((val * rateVal) / 100).toFixed(2);
                updatedData.cess = '0.00';
            } else {
                updatedData.igst = '';
                updatedData.cgst = '';
                updatedData.sgst = '';
                updatedData.cess = '';
                updatedData.taxAmount = '';
            }
        }

        setFormData(updatedData);
    };

    const handleSave = async () => {
        // Validation checks
        const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
        
        let hasErrors = false;
        if (secId === 'itc-available' || secId === 'itc-not-available') {
            if (!formData.supplierGSTIN || !formData.supplierName || !formData.taxableValue) hasErrors = true;
            if (secId === 'itc-available' && (formData.pos === 'Select' || !formData.invoiceNo || !formData.invoiceDate)) hasErrors = true;
            if (secId === 'itc-not-available' && formData.reason === 'Select') hasErrors = true;
        } else if (secId === 'debit-notes' || secId === 'credit-notes') {
            if (!formData.supplierGSTIN || !formData.taxableValue || formData.pos === 'Select') hasErrors = true;
            if (secId === 'debit-notes' && (!formData.debitNoteNo || !formData.noteDate)) hasErrors = true;
            if (secId === 'credit-notes' && (!formData.creditNoteNo || !formData.noteDate)) hasErrors = true;
        } else if (secId === 'import-goods') {
            if (!formData.portCode || !formData.boeNo || !formData.boeDate || !formData.taxableValue) hasErrors = true;
        } else if (secId === 'import-services') {
            if (!formData.country || !formData.invoiceNo || !formData.invoiceDate || !formData.taxableValue) hasErrors = true;
        }

        if (hasErrors) {
            toast.error("Please fill all mandatory fields correctly");
            return;
        }

        try {
            const newRecord = {
                ...formData,
                id: Date.now(),
                // Keep values as numeric fields
                taxableValue: parseFloat(formData.taxableValue) || 0,
                igst: parseFloat(formData.igst) || 0,
                cgst: parseFloat(formData.cgst) || 0,
                sgst: parseFloat(formData.sgst) || 0,
                cess: parseFloat(formData.cess) || 0,
                taxAmount: parseFloat(formData.taxAmount) || 0
            };

            const updatedRecords = [...records, newRecord];

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: config.tabName,
                data: { records: updatedRecords }
            });

            if (saveRes.data.success) {
                toast.success("Record added successfully!");
                setRecords(updatedRecords);
                setShowAddForm(false);
                // Reset form fields
                setFormData({
                    supplierGSTIN: '',
                    supplierName: '',
                    invoiceNo: '',
                    invoiceDate: '',
                    taxableValue: '',
                    pos: 'Select',
                    rate: '18%',
                    igst: '',
                    cgst: '',
                    sgst: '',
                    cess: '',
                    reason: 'Select',
                    taxAmount: '',
                    debitNoteNo: '',
                    creditNoteNo: '',
                    noteDate: '',
                    portCode: '',
                    boeNo: '',
                    boeDate: '',
                    country: ''
                });
            } else {
                toast.error("Failed to save record");
            }
        } catch (e) {
            console.error("Error saving record:", e);
            toast.error("Error occurred while saving details");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;

        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const updated = records.filter(r => r.id !== id);

            const saveRes = await api.post('/forms/save-tab', {
                trn,
                tabName: config.tabName,
                data: { records: updated }
            });

            if (saveRes.data.success) {
                toast.success("Record deleted successfully");
                setRecords(updated);
            }
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Delete failed");
        }
    };

    const formatCurr = (val) => {
        if (val === undefined || val === null) return "0.00";
        return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    if (loading) {
        return <div style={{ padding: '100px 50px', textAlign: 'center', fontSize: '18px', fontWeight: 600 }}>Loading Section Workspace...</div>;
    }

    return (
        <div className="dashboard-container" onClick={() => setActiveMenu(null)} style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />

            {/* Breadcrumbs */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr2b" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-2B</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>{config.title}</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Segment Content */}
            <div className="invoice-add-main-content">
                <div className="invoice-header-banner" style={{ backgroundColor: '#2b4b7c' }}>
                    <h2 className="invoice-title">{config.title} - Return Section Workspace</h2>
                </div>

                <div className="invoice-content-body">
                    {/* Back Arrow Header */}
                    <div className="invoice-top-bar" style={{ marginBottom: '15px' }}>
                        <button className="invoice-back-arrow" onClick={() => navigate('/returns/gstr2b')}>
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <button
                            className="invoice-btn-primary"
                            style={{ margin: 0, padding: '8px 16px', backgroundColor: '#1eb3a6' }}
                            onClick={() => setShowAddForm(prev => !prev)}
                        >
                            {showAddForm ? 'HIDE FORM' : 'ADD NEW RECORD'}
                        </button>
                    </div>

                    {/* Inline Form to Add a Record */}
                    {showAddForm && (
                        <div className="invoice-form-section" style={{ border: '1px dashed #2b4b7c', padding: '20px', borderRadius: '4px', marginBottom: '25px', backgroundColor: '#fafbfe' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#2b4b7c', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Enter Auto-Drafted Invoice Credit Details</h4>
                            
                            <div className="invoice-form-row">
                                {config.fields.includes('supplierGSTIN') && (
                                    <div className="invoice-form-group">
                                        <label>Supplier GSTIN <span className="red-dot">*</span></label>
                                        <input type="text" name="supplierGSTIN" value={formData.supplierGSTIN} onChange={handleChange} placeholder="e.g. 32ABCDE1234F1Z1" maxLength="15" />
                                    </div>
                                )}
                                {config.fields.includes('supplierName') && (
                                    <div className="invoice-form-group">
                                        <label>Supplier Name <span className="red-dot">*</span></label>
                                        <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} placeholder="Supplier trade name" />
                                    </div>
                                )}
                                {config.fields.includes('invoiceNo') && (
                                    <div className="invoice-form-group">
                                        <label>Invoice No. <span className="red-dot">*</span></label>
                                        <input type="text" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} placeholder="e.g. INV-001" />
                                    </div>
                                )}
                                {config.fields.includes('invoiceDate') && (
                                    <div className="invoice-form-group">
                                        <label>Invoice Date <span className="red-dot">*</span></label>
                                        <CustomDatePicker value={formData.invoiceDate} onChange={(val) => setFormData(prev => ({...prev, invoiceDate: val}))} />
                                    </div>
                                )}

                                {/* Debit Note Specifics */}
                                {config.fields.includes('debitNoteNo') && (
                                    <div className="invoice-form-group">
                                        <label>Debit Note No. <span className="red-dot">*</span></label>
                                        <input type="text" name="debitNoteNo" value={formData.debitNoteNo} onChange={handleChange} placeholder="e.g. DN-01" />
                                    </div>
                                )}
                                {/* Credit Note Specifics */}
                                {config.fields.includes('creditNoteNo') && (
                                    <div className="invoice-form-group">
                                        <label>Credit Note No. <span className="red-dot">*</span></label>
                                        <input type="text" name="creditNoteNo" value={formData.creditNoteNo} onChange={handleChange} placeholder="e.g. CN-01" />
                                    </div>
                                )}
                                {config.fields.includes('noteDate') && (
                                    <div className="invoice-form-group">
                                        <label>Note Date <span className="red-dot">*</span></label>
                                        <CustomDatePicker value={formData.noteDate} onChange={(val) => setFormData(prev => ({...prev, noteDate: val}))} />
                                    </div>
                                )}

                                {/* Import Goods Specifics */}
                                {config.fields.includes('portCode') && (
                                    <div className="invoice-form-group">
                                        <label>Port Code <span className="red-dot">*</span></label>
                                        <input type="text" name="portCode" value={formData.portCode} onChange={handleChange} placeholder="e.g. INCOK1" maxLength="6" />
                                    </div>
                                )}
                                {config.fields.includes('boeNo') && (
                                    <div className="invoice-form-group">
                                        <label>BOE No. (Bill of Entry) <span className="red-dot">*</span></label>
                                        <input type="text" name="boeNo" value={formData.boeNo} onChange={handleChange} placeholder="e.g. 9821732" />
                                    </div>
                                )}
                                {config.fields.includes('boeDate') && (
                                    <div className="invoice-form-group">
                                        <label>BOE Date <span className="red-dot">*</span></label>
                                        <CustomDatePicker value={formData.boeDate} onChange={(val) => setFormData(prev => ({...prev, boeDate: val}))} />
                                    </div>
                                )}

                                {/* Import Services Specifics */}
                                {config.fields.includes('country') && (
                                    <div className="invoice-form-group">
                                        <label>Country of Origin <span className="red-dot">*</span></label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. United States" />
                                    </div>
                                )}

                                {/* Reason Dropdown for Not Avail */}
                                {config.fields.includes('reason') && (
                                    <div className="invoice-form-group">
                                        <label>Ineligibility Reason <span className="red-dot">*</span></label>
                                        <select name="reason" value={formData.reason} onChange={handleChange}>
                                            {reasonsList.map((r, i) => <option key={i}>{r}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="invoice-form-row">
                                <div className="invoice-form-group">
                                    <label>Taxable Value (₹) <span className="red-dot">*</span></label>
                                    <input type="number" name="taxableValue" value={formData.taxableValue} onChange={handleChange} placeholder="e.g. 50000" />
                                </div>

                                {config.fields.includes('pos') && (
                                    <div className="invoice-form-group">
                                        <label>Place of Supply (POS) <span className="red-dot">*</span></label>
                                        <select name="pos" value={formData.pos} onChange={handleChange}>
                                            <option>Select</option>
                                            <option>32-Kerala</option>
                                            <option>09-Uttar Pradesh</option>
                                            <option>27-Maharashtra</option>
                                            <option>29-Karnataka</option>
                                            <option>33-Tamil Nadu</option>
                                            <option>07-Delhi</option>
                                            <option>19-West Bengal</option>
                                        </select>
                                    </div>
                                )}

                                {config.fields.includes('rate') && (
                                    <div className="invoice-form-group">
                                        <label>GST Tax Rate (%)</label>
                                        <select name="rate" value={formData.rate} onChange={handleChange}>
                                            {ratesList.map((r, i) => <option key={i}>{r}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Taxes Output */}
                            {config.fields.includes('taxes') && (
                                <div className="invoice-form-row" style={{ backgroundColor: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                    <div className="invoice-form-group">
                                        <label style={{ fontWeight: 'bold' }}>Integrated Tax (₹)</label>
                                        <input type="text" value={formData.igst} disabled className="disabled-input" />
                                    </div>
                                    <div className="invoice-form-group">
                                        <label style={{ fontWeight: 'bold' }}>Central Tax (₹)</label>
                                        <input type="text" value={formData.cgst} disabled className="disabled-input" />
                                    </div>
                                    <div className="invoice-form-group">
                                        <label style={{ fontWeight: 'bold' }}>State/UT Tax (₹)</label>
                                        <input type="text" value={formData.sgst} disabled className="disabled-input" />
                                    </div>
                                </div>
                            )}

                            {/* ITC Not Available Manual Tax Field */}
                            {secId === 'itc-not-available' && (
                                <div className="invoice-form-row">
                                    <div className="invoice-form-group">
                                        <label>Total Blocked Tax Amount (₹)</label>
                                        <input type="text" name="taxAmount" value={formData.taxAmount} onChange={handleChange} placeholder="Calculated tax amount" />
                                    </div>
                                </div>
                            )}

                            {/* BOE Manual IGST */}
                            {(secId === 'import-goods' || secId === 'import-services') && (
                                <div className="invoice-form-row">
                                    <div className="invoice-form-group">
                                        <label>Calculated IGST Credit (₹)</label>
                                        <input type="text" name="igst" value={formData.igst} onChange={handleChange} placeholder="e.g. 9000.00" />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <button className="invoice-btn-outline" style={{ padding: '8px 20px' }} onClick={() => setShowAddForm(false)}>CANCEL</button>
                                <button className="invoice-btn-primary" style={{ padding: '8px 20px', backgroundColor: '#2b4b7c' }} onClick={handleSave}>ADD TO STATEMENT</button>
                            </div>
                        </div>
                    )}

                    {/* Records List Table Grid */}
                    <h3 className="section-title">Saved Section Invoices</h3>
                    <div className="invoice-table-container">
                        <table className="invoice-item-table" style={{ fontSize: '13px' }}>
                            <thead>
                                {secId === 'itc-available' && (
                                    <tr>
                                        <th>Supplier GSTIN</th>
                                        <th>Supplier Name</th>
                                        <th>Invoice No.</th>
                                        <th>Invoice Date</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>IGST (₹)</th>
                                        <th>CGST (₹)</th>
                                        <th>SGST (₹)</th>
                                        <th>Cess (₹)</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                                {secId === 'itc-not-available' && (
                                    <tr>
                                        <th>Supplier GSTIN</th>
                                        <th>Supplier Name</th>
                                        <th>Ineligibility Reason</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>Blocked Tax (₹)</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                                {(secId === 'debit-notes' || secId === 'credit-notes') && (
                                    <tr>
                                        <th>Supplier GSTIN</th>
                                        <th>Note No.</th>
                                        <th>Note Date</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>IGST (₹)</th>
                                        <th>CGST (₹)</th>
                                        <th>SGST (₹)</th>
                                        <th>Cess (₹)</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                                {secId === 'import-goods' && (
                                    <tr>
                                        <th>Port Code</th>
                                        <th>BOE No.</th>
                                        <th>BOE Date</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>Import IGST (₹)</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                                {secId === 'import-services' && (
                                    <tr>
                                        <th>Country</th>
                                        <th>Supplier Name</th>
                                        <th>Invoice No.</th>
                                        <th>Invoice Date</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>Import IGST (₹)</th>
                                        <th>Actions</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: '#6b7280', fontSize: '14px' }}>No records saved in this section yet. Click "Add New Record" to declare mock transactions.</td>
                                    </tr>
                                ) : (
                                    records.map((r, index) => (
                                        <tr key={index}>
                                            {secId === 'itc-available' && (
                                                <>
                                                    <td>{r.supplierGSTIN || r.supplierGstin}</td>
                                                    <td>{r.supplierName}</td>
                                                    <td>{r.invoiceNo}</td>
                                                    <td>{r.invoiceDate}</td>
                                                    <td>{formatCurr(r.taxableValue)}</td>
                                                    <td style={{ color: r.igst > 0 ? '#1e40af' : '#6b7280' }}>{formatCurr(r.igst)}</td>
                                                    <td>{formatCurr(r.cgst)}</td>
                                                    <td>{formatCurr(r.sgst)}</td>
                                                    <td>{formatCurr(r.cess)}</td>
                                                </>
                                            )}
                                            {secId === 'itc-not-available' && (
                                                <>
                                                    <td>{r.supplierGSTIN || r.supplierGstin}</td>
                                                    <td>{r.supplierName}</td>
                                                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{r.reason}</td>
                                                    <td>{formatCurr(r.taxableValue)}</td>
                                                    <td style={{ color: '#ef4444' }}>{formatCurr(r.taxAmount)}</td>
                                                </>
                                            )}
                                            {(secId === 'debit-notes' || secId === 'credit-notes') && (
                                                <>
                                                    <td>{r.supplierGSTIN || r.supplierGstin}</td>
                                                    <td>{r.debitNoteNo || r.creditNoteNo}</td>
                                                    <td>{r.noteDate}</td>
                                                    <td>{formatCurr(r.taxableValue)}</td>
                                                    <td style={{ color: r.igst > 0 ? '#1e40af' : '#6b7280' }}>{formatCurr(r.igst)}</td>
                                                    <td>{formatCurr(r.cgst)}</td>
                                                    <td>{formatCurr(r.sgst)}</td>
                                                    <td>{formatCurr(r.cess)}</td>
                                                </>
                                            )}
                                            {secId === 'import-goods' && (
                                                <>
                                                    <td>{r.portCode}</td>
                                                    <td>{r.boeNo}</td>
                                                    <td>{r.boeDate}</td>
                                                    <td>{formatCurr(r.taxableValue)}</td>
                                                    <td style={{ color: '#1e40af', fontWeight: 600 }}>{formatCurr(r.igst)}</td>
                                                </>
                                            )}
                                            {secId === 'import-services' && (
                                                <>
                                                    <td>{r.country}</td>
                                                    <td>{r.supplierName || 'N/A'}</td>
                                                    <td>{r.invoiceNo}</td>
                                                    <td>{r.invoiceDate}</td>
                                                    <td>{formatCurr(r.taxableValue)}</td>
                                                    <td style={{ color: '#1e40af', fontWeight: 600 }}>{formatCurr(r.igst)}</td>
                                                </>
                                            )}
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}
                                                    title="Delete transaction"
                                                >
                                                    🗑️ DELETE
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="invoice-bottom-actions" style={{ marginTop: '20px' }}>
                        <button className="invoice-btn-outline" onClick={() => navigate('/returns/gstr2b')}>BACK TO DASHBOARD</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GSTR2BSectionManager;
