import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const GSTR2BSummary = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fy = searchParams.get('fy') || '2025-26';
    const monthParam = searchParams.get('month') || 'March';

    const [loading, setLoading] = useState(true);
    const [activeMainTab, setActiveMainTab] = useState('SUMMARY');
    const [activeSubTab, setActiveSubTab] = useState('itc_available');
    const [expandedRows, setExpandedRows] = useState({});
    
    const [profile, setProfile] = useState({
        gstin: '', legalName: '', tradeName: '', trn: ''
    });

    const emptySum = { count: 0, taxableValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, totalItc: 0 };
    const [boxes, setBoxes] = useState({
        allOtherItc: emptySum, registered: emptySum, isd: emptySum, revCharge: emptySum, 
        importGoods: emptySum, sez: emptySum, cdnr: emptySum, amendments: emptySum,
        itcNotAvailable: emptySum, itcAvailable: emptySum
    });

    const [rawRecords, setRawRecords] = useState({
        registered: [], isd: [], revCharge: [], importGoods: [], sez: [], cdnr: [], amendments: []
    });

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            try {
                const profRes = await api.get(`/forms/gstr1-profile/${trn}`);
                if (profRes.data?.success && profRes.data?.data) {
                    setProfile({ ...profRes.data.data, trn });
                } else {
                    setProfile(p => ({ ...p, trn }));
                }
            } catch (_) {
                setProfile(p => ({ ...p, trn }));
            }

            const gstr2bRes = await api.get(`/gstr2b/summary/${trn}`);
            if (gstr2bRes.data?.success && gstr2bRes.data?.data) {
                setBoxes(gstr2bRes.data.data.boxes);
                setRawRecords(gstr2bRes.data.data.rawRecords || {});
            }

        } catch (err) {
            console.error('GSTR-2B load failed:', err);
            toast.error('Failed to load GSTR-2B Data');
        } finally {
            setLoading(false);
        }
    };

    const fmt = (val) => parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const toggleRow = (id) => setExpandedRows(p => ({ ...p, [id]: !p[id] }));

    const InvoiceDetailTable = ({ records }) => {
        if (!records || records.length === 0) {
            return (
                <tr style={{ background: '#fcfcfc' }}>
                    <td colSpan="7" style={{ padding: '15px', textAlign: 'center', color: '#777', fontStyle: 'italic', fontSize: '12px', border: '1px solid #ddd' }}>
                        No records available.
                    </td>
                </tr>
            );
        }

        return (
            <tr>
                <td colSpan="7" style={{ padding: '0', border: '1px solid #ddd' }}>
                    <div style={{ padding: '15px', background: '#f5f5f5' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: 'white', border: '1px solid #ccc' }}>
                            <thead>
                                <tr style={{ background: '#eaeaea' }}>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>Supplier GSTIN</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>Supplier Name</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>Invoice No.</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'left' }}>Date</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>Taxable Value</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>IGST</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>CGST</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>SGST</th>
                                    <th style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>Cess</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r, i) => {
                                    // Aggregate item totals for this record if available
                                    let items = r.items || r.itemDetails || r.taxItems || r.tax_items || [];
                                    let taxable = 0, igst = 0, cgst = 0, sgst = 0, cess = 0;
                                    if(items.length > 0) {
                                        items.forEach(item => {
                                            taxable += parseFloat(item.taxableValue || item.taxable_value || 0);
                                            igst += parseFloat(item.integratedTax || item.igst || 0);
                                            cgst += parseFloat(item.centralTax || item.cgst || 0);
                                            sgst += parseFloat(item.stateTax || item.sgst || 0);
                                            cess += parseFloat(item.cess || 0);
                                        });
                                    } else {
                                        taxable = parseFloat(r.taxableValue || r.taxable_value || r.totalInvoiceValue || 0);
                                        igst = parseFloat(r.igst || r.integratedTax || 0);
                                        cgst = parseFloat(r.cgst || r.centralTax || 0);
                                        sgst = parseFloat(r.sgst || r.stateTax || 0);
                                        cess = parseFloat(r.cess || 0);
                                    }

                                    return (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.supplier_gstin || r.receiver_gstin || 'N/A'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.supplier_name || r.receiver_name || 'N/A'}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px', color: '#1a73e8' }}>{r.invoiceNumber || r.invoice_number || r.noteNumber || r.note_number}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px' }}>{r.invoiceDate || r.invoice_date || r.noteDate || r.note_date}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmt(taxable)}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmt(igst)}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmt(cgst)}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmt(sgst)}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '6px', textAlign: 'right' }}>{fmt(cess)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        );
    };

    const SummaryRow = ({ id, sno, title, tableRef, sumData, rawData }) => {
        const isExpanded = expandedRows[id];
        return (
            <>
                <tr style={{ background: 'white' }}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{sno}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleRow(id)}>
                            <span style={{ 
                                display: 'inline-block', width: '20px', height: '20px', 
                                background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '50%',
                                textAlign: 'center', lineHeight: '18px', marginRight: '10px',
                                color: '#1a73e8', fontWeight: 'bold' 
                            }}>
                                {isExpanded ? '−' : '+'}
                            </span>
                            <span style={{ color: '#1a73e8', textDecoration: 'none' }}>{title}</span>
                        </div>
                    </td>
                    {tableRef && <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{tableRef}</td>}
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(sumData?.igst)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(sumData?.cgst)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(sumData?.sgst)}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{fmt(sumData?.cess)}</td>
                </tr>
                {isExpanded && <InvoiceDetailTable records={rawData} />}
            </>
        );
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial' }}>Loading GSTR-2B Data...</div>;

    const todayDate = new Date().toLocaleDateString('en-GB');

    return (
        <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <Toaster position="top-right" />
            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '20px', paddingBottom: '50px' }}>
                
                {/* GST Portal Style Header Section */}
                <div style={{ background: '#fcfcfc', border: '1px solid #ddd', borderBottom: 'none' }}>
                    <div style={{ background: '#00bcd4', color: 'white', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold' }}>
                        GSTR-2B — AUTO-DRAFTED ITC STATEMENT
                    </div>
                    <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div>
                            <div style={{ marginBottom: '8px' }}><strong>GSTIN</strong></div>
                            <div style={{ color: '#333' }}>{profile.gstin || profile.legalName || '...'}</div>
                            <div style={{ marginTop: '15px', marginBottom: '8px' }}><strong>Financial Year</strong></div>
                            <div style={{ color: '#333' }}>{fy}</div>
                        </div>
                        <div>
                            <div style={{ marginBottom: '8px' }}><strong>Legal Name</strong></div>
                            <div style={{ color: '#333' }}>{profile.legalName || '...'}</div>
                            <div style={{ marginTop: '15px', marginBottom: '8px' }}><strong>Return Period</strong></div>
                            <div style={{ color: '#333' }}>{monthParam}</div>
                        </div>
                        <div>
                            <div style={{ marginBottom: '8px' }}><strong>Trade Name</strong></div>
                            <div style={{ color: '#333' }}>{profile.tradeName || profile.legalName || '...'}</div>
                            <div style={{ marginTop: '15px', marginBottom: '8px' }}><strong>Generation Date</strong></div>
                            <div style={{ color: '#333' }}>{todayDate}</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px' }}>
                    {/* Main Navigation Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                        {['SUMMARY', 'ALL TABLES'].map(tab => (
                            <button key={tab} onClick={() => setActiveMainTab(tab)}
                                style={{ padding: '10px 25px', cursor: 'pointer', fontSize: '14px', border: 'none', background: 'none',
                                    color: activeMainTab === tab ? '#1a73e8' : '#555',
                                    borderBottom: activeMainTab === tab ? '3px solid #1a73e8' : 'none',
                                    fontWeight: activeMainTab === tab ? 'bold' : 'normal' }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeMainTab === 'SUMMARY' && (
                        <>
                            {/* ITC Sub Tabs */}
                            <div style={{ display: 'flex', marginBottom: '20px', gap: '5px' }}>
                                {[
                                    { key: 'itc_available', label: 'ITC Available' },
                                    { key: 'itc_not_available', label: 'ITC Not Available' },
                                    { key: 'itc_reversal', label: 'ITC Reversal' },
                                    { key: 'itc_rejected', label: 'ITC Rejected' }
                                ].map(({ key, label }) => (
                                    <button key={key} onClick={() => setActiveSubTab(key)}
                                        style={{ 
                                            padding: '10px 20px', cursor: 'pointer', fontSize: '13px', 
                                            border: '1px solid #1a73e8', borderRadius: '4px',
                                            background: activeSubTab === key ? '#d9534f' : 'white',
                                            color: activeSubTab === key ? 'white' : '#1a73e8',
                                            fontWeight: 'bold', transition: 'all 0.2s'
                                        }}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {activeSubTab === 'itc_available' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #ddd' }}>
                                    <thead>
                                        <tr>
                                            {['S.No.', 'Heading', 'GSTR-3B Table', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'].map((h, i) => (
                                                <th key={i} style={{ border: '1px solid #ddd', padding: '10px', textAlign: i > 2 ? 'right' : 'center', background: '#fce4e4', color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>Part A</td>
                                            <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>
                                                ITC Available - Credit may be claimed in relevant headings in GSTR-3B
                                            </td>
                                        </tr>
                                        <SummaryRow id="av_a1" sno="I" title="All other ITC - Supplies from registered persons" tableRef="4(A)(5)" sumData={boxes.registered} rawData={rawRecords.registered} />
                                        <SummaryRow id="av_a2" sno="II" title="Inward Supplies from ISD" tableRef="4(A)(4)" sumData={boxes.isd} rawData={rawRecords.isd} />
                                        <SummaryRow id="av_a3" sno="III" title="Inward Supplies liable for Reverse Charge" tableRef="3.1(d) / 4(A)(3)" sumData={boxes.revCharge} rawData={rawRecords.revCharge} />
                                        <SummaryRow id="av_a4" sno="IV" title="Import of Goods" tableRef="4(A)(1)" sumData={boxes.importGoods} rawData={rawRecords.importGoods} />
                                        <SummaryRow id="av_a5" sno="V" title="Import of Goods from SEZ" tableRef="4(A)(1)" sumData={boxes.sez} rawData={rawRecords.sez} />
                                        
                                        <tr>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>Part B</td>
                                            <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>
                                                ITC Available - Credit notes should be net off against relevant ITC available headings in GSTR-3B
                                            </td>
                                        </tr>
                                        <SummaryRow id="av_b1" sno="I" title="Others" tableRef="4(A)" sumData={boxes.cdnr} rawData={rawRecords.cdnr} />
                                    </tbody>
                                </table>
                            )}

                            {activeSubTab === 'itc_not_available' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #ddd' }}>
                                    <thead>
                                        <tr>
                                            {['S.No.', 'Heading', 'GSTR-3B Table', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'].map((h, i) => (
                                                <th key={i} style={{ border: '1px solid #ddd', padding: '10px', textAlign: i > 2 ? 'right' : 'center', background: '#fce4e4', color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>Part A</td>
                                            <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>
                                                ITC Not Available
                                            </td>
                                        </tr>
                                        <SummaryRow id="na_a1" sno="I" title="All other ITC - Supplies from registered persons" tableRef="-" sumData={emptySum} rawData={[]} />
                                        <SummaryRow id="na_a2" sno="II" title="Inward Supplies from ISD" tableRef="-" sumData={emptySum} rawData={[]} />
                                        <SummaryRow id="na_a3" sno="III" title="Inward Supplies liable for reverse charge" tableRef="-" sumData={emptySum} rawData={[]} />
                                        
                                        <tr>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>Part B</td>
                                            <td colSpan="6" style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>
                                                ITC Not Available (Credit Notes)
                                            </td>
                                        </tr>
                                        <SummaryRow id="na_b1" sno="I" title="Others" tableRef="-" sumData={emptySum} rawData={[]} />
                                    </tbody>
                                </table>
                            )}

                            {activeSubTab === 'itc_reversal' && (
                                <>
                                    <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', color: '#1565c0', padding: '10px', fontSize: '13px', marginBottom: '15px' }}>
                                        Data will be available in GSTR-2B of September month.
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #ddd' }}>
                                        <thead>
                                            <tr>
                                                {['S.No.', 'Heading', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'].map((h, i) => (
                                                    <th key={i} style={{ border: '1px solid #ddd', padding: '10px', textAlign: i > 1 ? 'right' : 'center', background: '#fce4e4', color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <SummaryRow id="rev_1" sno="1" title="ITC Reversed - Others" tableRef={null} sumData={emptySum} rawData={[]} />
                                            <SummaryRow id="rev_2" sno="2" title="ITC Reversal on account of Rule 37A" tableRef={null} sumData={emptySum} rawData={[]} />
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {activeSubTab === 'itc_rejected' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', border: '1px solid #ddd' }}>
                                    <thead>
                                        <tr>
                                            {['S.No.', 'Heading', 'Integrated Tax', 'Central Tax', 'State/UT Tax', 'Cess'].map((h, i) => (
                                                <th key={i} style={{ border: '1px solid #ddd', padding: '10px', textAlign: i > 1 ? 'right' : 'center', background: '#fce4e4', color: '#333', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>Part A</td>
                                            <td colSpan="5" style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>
                                                Rejected Records - Invoices rejected on IMS Dashboard
                                            </td>
                                        </tr>
                                        <SummaryRow id="rej_a1" sno="I" title="All other ITC - Supplies from registered persons" tableRef={null} sumData={emptySum} rawData={[]} />
                                        <SummaryRow id="rej_a2" sno="II" title="Inward Supplies from ISD" tableRef={null} sumData={emptySum} rawData={[]} />
                                        
                                        <tr>
                                            <td style={{ textAlign: 'center', border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>Part B</td>
                                            <td colSpan="5" style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', background: '#f5f5f5' }}>
                                                Rejected Records - Credit Notes rejected on IMS Dashboard
                                            </td>
                                        </tr>
                                        <SummaryRow id="rej_b1" sno="I" title="Others" tableRef={null} sumData={emptySum} rawData={[]} />
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeMainTab === 'ALL TABLES' && (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#777', border: '1px solid #ddd' }}>
                            All Tables view is under construction. Please use the SUMMARY tab to view invoice-wise details.
                        </div>
                    )}
                </div>

                {/* Button Section (Exact GST Portal Styling) */}
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    {/* First Row Buttons */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => navigate('/returns-dashboard')} style={{ background: 'white', color: '#1a73e8', border: '1px solid #1a73e8', padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>BACK TO DASHBOARD</button>
                        <button style={{ background: '#1a73e8', color: 'white', border: '1px solid #1a73e8', padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>DOWNLOAD GSTR-2B SUMMARY (PDF)</button>
                        <button style={{ background: '#1a73e8', color: 'white', border: '1px solid #1a73e8', padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>DOWNLOAD GSTR-2B DETAILS (EXCEL)</button>
                    </div>
                    {/* Second Row Buttons */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button style={{ background: 'white', color: '#1a73e8', border: '1px solid #1a73e8', padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>OPEN GSTR-3B</button>
                        <button style={{ background: 'white', color: '#1a73e8', border: '1px solid #1a73e8', padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>OPEN IMS DASHBOARD</button>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div style={{ background: '#123456', color: 'white', padding: '20px 10%', display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '40px' }}>
                <span>© 2025-26 Goods and Services Tax Network</span>
                <span>Designed & Developed by GSTN</span>
            </div>
        </div>
    );
};

export default GSTR2BSummary;
