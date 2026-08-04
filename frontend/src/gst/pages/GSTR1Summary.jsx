import React, { useState, useEffect } from 'react';
import gstr1Service from '../services/gstr1Service';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; 
import './GSTR1Dashboard.css';
import './GSTR1Summary.css';
import toast from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const GSTR1Summary = () => {
    const navigate = useNavigate();
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedRecipients, setExpandedRecipients] = useState({});

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

                // Fetch live counts from Supabase
                const countRes = await gstr1Service.getGstr1Counts(trn);
                const c = countRes.data || {};

                // Fetch AdvTax records and aggregate
                const advTaxRes = await gstr1Service.getGstr1Records('gstr1_adv_tax', trn);
                const advTaxRecords = advTaxRes.success && advTaxRes.data ? advTaxRes.data : [];
                const advTaxAgg = advTaxRecords.reduce((agg, rec) => {
                    agg.gross += parseFloat(rec.gross_advance_received) || 0;
                    agg.igst += parseFloat(rec.integrated_tax) || 0;
                    agg.cgst += parseFloat(rec.central_tax) || 0;
                    agg.sgst += parseFloat(rec.state_ut_tax) || 0;
                    agg.cess += parseFloat(rec.cess) || 0;
                    return agg;
                }, { gross: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });

                // Fetch AdjAdvances records and aggregate
                const adjAdvRes = await gstr1Service.getGstr1Records('gstr1_adj_advances', trn);
                const adjAdvRecords = adjAdvRes.success && adjAdvRes.data ? adjAdvRes.data : [];
                const adjAdvAgg = adjAdvRecords.reduce((agg, rec) => {
                    agg.gross += parseFloat(rec.gross_advance_adjusted) || 0;
                    agg.igst += parseFloat(rec.integrated_tax) || 0;
                    agg.cgst += parseFloat(rec.central_tax) || 0;
                    agg.sgst += parseFloat(rec.state_ut_tax) || 0;
                    agg.cess += parseFloat(rec.cess) || 0;
                    return agg;
                }, { gross: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 });

                setSummaryData({
                    b2b: { records: c.b2b || 0 },
                    b2bReverse: { records: 0 },
                    sez: { records: 0 },
                    deemedExports: { records: 0 },
                    b2cl: { records: c.b2cl || 0 },
                    exports: { records: c.exports || 0 },
                    b2cs: { records: c.b2cs || 0 },
                    nilRated: { records: c.nilRated || 0 },
                    cdnr: { records: c.cdnr || 0 },
                    cdnur: { records: c.cdnur || 0 },
                    advTax: {
                        records: c.advTax || 0,
                        value: advTaxAgg.gross,
                        igst: advTaxAgg.igst,
                        cgst: advTaxAgg.cgst,
                        sgst: advTaxAgg.sgst,
                        cess: advTaxAgg.cess
                    },
                    adjAdvances: {
                        records: c.adjAdvances || 0,
                        value: adjAdvAgg.gross,
                        igst: adjAdvAgg.igst,
                        cgst: adjAdvAgg.cgst,
                        sgst: adjAdvAgg.sgst,
                        cess: adjAdvAgg.cess
                    },
                    hsn: { records: c.hsn || 0 },
                    documents: { records: c.documents || 0 },
                    eco: { records: c.eco || 0 },
                    sup95: { records: c.sup95 || 0 },
                    rawRecords: {
                        GSTR1_AdvTax_Invoices: { records: advTaxRecords },
                        GSTR1_AdjAdvances_Invoices: { records: adjAdvRecords }
                    }
                });
            } catch (error) {
                console.error("Failed to fetch summary counts", error);
                toast.error("Failed to load summary counts");
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const formatCurr = (val) => {
        if (val === undefined || val === null) return "0.00";
        return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleRefresh = () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const handleReset = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to reset GSTR-1?\nAll saved GSTR-1 data will be permanently deleted.\nThis action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            await gstr1Service.resetGstr1Data(trn);

            toast.success('GSTR-1 data reset successfully.');
            setSummaryData({
               b2b: { records: 0 },
               b2bReverse: { records: 0 },
               sez: { records: 0 },
               deemedExports: { records: 0 },
               b2cl: { records: 0 },
               exports: { records: 0 },
               b2cs: { records: 0 },
               nilRated: { records: 0 },
               cdnr: { records: 0 },
               cdnur: { records: 0 },
               advTax: { records: 0 },
               adjAdvances: { records: 0 },
               hsn: { records: 0 },
               documents: { records: 0 },
               eco: { records: 0 },
               sup95: { records: 0 },
               rawRecords: {}
            });
        } catch (error) {
            toast.error('Reset failed: ' + error.message);
            setLoading(false);
        }
    };

    const s = summaryData || {};

    const getInvoicesForSection = (key) => {
        const raw = s.rawRecords || {};
        if (key === 'b2b') {
            const list = raw.GSTR1_B2B_Invoices?.invoices || [];
            return list.filter(inv => !inv.isReverseCharge && !inv.isSEZWithPayment && !inv.isSEZWithoutPayment && !inv.isDeemedExport);
        }
        if (key === 'b2bReverse') {
            const list = raw.GSTR1_B2B_Invoices?.invoices || [];
            return list.filter(inv => inv.isReverseCharge);
        }
        if (key === 'sez') {
            const list = raw.GSTR1_B2B_Invoices?.invoices || [];
            return list.filter(inv => inv.isSEZWithPayment || inv.isSEZWithoutPayment);
        }
        if (key === 'deemedExports') {
            const list = raw.GSTR1_B2B_Invoices?.invoices || [];
            return list.filter(inv => inv.isDeemedExport);
        }
        if (key === 'b2cl') return raw.GSTR1_B2CL_Invoices?.invoices || [];
        if (key === 'exports') return raw.GSTR1_Exports_Invoices?.invoices || [];
        if (key === 'b2cs') return raw.GSTR1_B2CS_Invoices?.invoices || [];
        if (key === 'nilRated') return raw.GSTR1_NilRated_Supplies?.invoices || [];
        if (key === 'cdnr') return raw.GSTR1_CDNR_Invoices?.invoices || [];
        if (key === 'cdnur') return raw.GSTR1_CDNUR_Invoices?.invoices || [];
        if (key === 'advTax') return raw.GSTR1_AdvTax_Invoices?.records || [];
        if (key === 'adjAdvances') return raw.GSTR1_AdjAdvances_Invoices?.records || [];
        if (key === 'hsn') return [...(raw.GSTR1_HSN_B2B?.invoices || []), ...(raw.GSTR1_HSN_B2C?.invoices || [])];
        if (key === 'eco') return [...(raw.GSTR1_ECO_TCS?.invoices || []), ...(raw.GSTR1_ECO_PAY?.invoices || [])];
        if (key === 'sup95') {
            return [
                ...(raw.GSTR1_SUP95_R2R?.records || []),
                ...(raw.GSTR1_SUP95_R2NR?.records || []),
                ...(raw.GSTR1_SUP95_NR2R?.records || []),
                ...(raw.GSTR1_SUP95_NR2NR?.records || [])
            ];
        }
        return [];
    };

    const groupInvoicesByRecipient = (invoices) => {
        if (!Array.isArray(invoices)) return {};
        const groups = {};
        invoices.forEach(inv => {
            const gstin = inv.recipientGSTIN || inv.recipientGstin || inv.supplierGstin || inv.gstin || "URP-CONSUMER";
            const name = inv.recipientName || inv.supplierName || inv.tradeName || inv.legalName || "Consumer Supplies";
            
            if (!groups[gstin]) {
                groups[gstin] = {
                    gstin,
                    name,
                    recordsCount: 0,
                    value: 0,
                    igst: 0,
                    cgst: 0,
                    sgst: 0,
                    cess: 0,
                    invoices: []
                };
            }
            
            let val = parseFloat(inv.taxableValue || inv.totalInvoiceValue || inv.netValue || inv.value) || 0;
            let igst = parseFloat(inv.integratedTax) || 0;
            let cgst = parseFloat(inv.centralTax) || 0;
            let sgst = parseFloat(inv.stateTax) || 0;
            let cess = parseFloat(inv.cess) || 0;
            
            if (Array.isArray(inv.itemDetails) && inv.itemDetails.length > 0) {
                let hasDetails = false;
                let itemVal = 0, itemIgst = 0, itemCgst = 0, itemSgst = 0, itemCess = 0;
                inv.itemDetails.forEach(item => {
                    if (item.taxableValue) {
                        hasDetails = true;
                        itemVal += parseFloat(item.taxableValue) || 0;
                        itemIgst += parseFloat(item.integratedTax) || 0;
                        itemCgst += parseFloat(item.centralTax) || 0;
                        itemSgst += parseFloat(item.stateTax) || 0;
                        itemCess += parseFloat(item.cess) || 0;
                    }
                });
                if (hasDetails) {
                    val = itemVal;
                    igst = itemIgst;
                    cgst = itemCgst;
                    sgst = itemSgst;
                    cess = itemCess;
                }
            }
            
            groups[gstin].recordsCount++;
            groups[gstin].value += val;
            groups[gstin].igst += igst;
            groups[gstin].cgst += cgst;
            groups[gstin].sgst += sgst;
            groups[gstin].cess += cess;
            groups[gstin].invoices.push({
                ...inv,
                computedVal: val,
                computedIgst: igst,
                computedCgst: cgst,
                computedSgst: sgst,
                computedCess: cess
            });
        });
        return groups;
    };

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const toggleRecipient = (sectionKey, gstin) => {
        setExpandedRecipients(prev => ({
            ...prev,
            [`${sectionKey}_${gstin}`]: !prev[`${sectionKey}_${gstin}`]
        }));
    };

    const handleExpandAll = () => {
        const sections = ["b2b", "b2bReverse", "b2cl", "exports", "sez", "deemedExports", "b2cs", "nilRated", "cdnr", "cdnur", "advTax", "adjAdvances", "hsn", "eco", "sup95"];
        const nextSections = {};
        sections.forEach(s => nextSections[s] = true);
        setExpandedSections(nextSections);
        
        const nextRecipients = {};
        sections.forEach(key => {
            const invoicesList = getInvoicesForSection(key);
            const grouped = groupInvoicesByRecipient(invoicesList);
            Object.keys(grouped).forEach(gstin => {
                nextRecipients[`${key}_${gstin}`] = true;
            });
        });
        setExpandedRecipients(nextRecipients);
    };

    const handleCollapseAll = () => {
        setExpandedSections({});
        setExpandedRecipients({});
    };

    const hasRecords = (
        (s.b2b?.records || 0) + (s.b2bReverse?.records || 0) + (s.b2cl?.records || 0) + 
        (s.exports?.records || 0) + (s.sez?.records || 0) + (s.deemedExports?.records || 0) + 
        (s.b2cs?.records || 0) + (s.nilRated?.records || 0) + (s.cdnr?.records || 0) + 
        (s.cdnur?.records || 0) + (s.advTax?.records || 0) + (s.adjAdvances?.records || 0) + 
        (s.hsn?.records || 0) + (s.eco?.records || 0) + (s.sup95?.records || 0)
    ) > 0;

    const handleFileStatement = () => {
        if (!hasRecords) return;
        toast.success("GSTR-1 Statement successfully filed to GST portal sandbox!");
    };

    const renderNestedInvoices = (sectionKey) => {
        const invoices = getInvoicesForSection(sectionKey);
        if (invoices.length === 0) {
            return (
                <tr className="nested-drawer-row">
                    <td colSpan="8" style={{ textAlign: 'center', padding: '15px', color: '#999', backgroundColor: '#fafafa' }}>
                        No records found for this section.
                    </td>
                </tr>
            );
        }

        const grouped = groupInvoicesByRecipient(invoices);
        return (
            <tr className="nested-drawer-row">
                <td colSpan="8" className="nested-summary-container">
                    <table className="nested-summary-table">
                        <thead>
                            <tr>
                                <th>GSTIN / UIN</th>
                                <th>Recipient Name</th>
                                <th>No. of Invoices</th>
                                <th>Taxable Value (₹)</th>
                                <th>IGST (₹)</th>
                                <th>CGST (₹)</th>
                                <th>SGST (₹)</th>
                                <th>Cess (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(grouped).map(group => (
                                <React.Fragment key={group.gstin}>
                                    <tr className="nested-recipient-row" onClick={() => toggleRecipient(sectionKey, group.gstin)}>
                                        <td>
                                            <span className={`section-arrow ${expandedRecipients[`${sectionKey}_${group.gstin}`] ? 'expanded' : ''}`}>▶</span>
                                            {group.gstin}
                                        </td>
                                        <td>{group.name}</td>
                                        <td style={{ textAlign: 'right' }}>{group.recordsCount}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurr(group.value)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurr(group.igst)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurr(group.cgst)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurr(group.sgst)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurr(group.cess)}</td>
                                    </tr>
                                    {expandedRecipients[`${sectionKey}_${group.gstin}`] && (
                                        <tr>
                                            <td colSpan="8" style={{ padding: '8px 15px', backgroundColor: '#ffffff' }}>
                                                <table className="nested-summary-table" style={{ margin: 0, width: '100%' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                            <th>Document No.</th>
                                                            <th>Document Date</th>
                                                            <th>POS</th>
                                                            <th>Supply Type</th>
                                                            <th>Taxable Value (₹)</th>
                                                            <th>IGST (₹)</th>
                                                            <th>CGST (₹)</th>
                                                            <th>SGST (₹)</th>
                                                            <th>Cess (₹)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {group.invoices.map((inv, idx) => (
                                                            <tr key={idx}>
                                                                <td>{inv.invoiceNo || inv.noteNumber || inv.documentNumber || "N/A"}</td>
                                                                <td>{inv.invoiceDate || inv.noteDate || inv.documentDate || "N/A"}</td>
                                                                <td>{inv.pos || "N/A"}</td>
                                                                <td>{inv.supplyType || "N/A"}</td>
                                                                <td style={{ textAlign: 'right' }}>{formatCurr(inv.computedVal)}</td>
                                                                <td style={{ textAlign: 'right' }}>{formatCurr(inv.computedIgst)}</td>
                                                                <td style={{ textAlign: 'right' }}>{formatCurr(inv.computedCgst)}</td>
                                                                <td style={{ textAlign: 'right' }}>{formatCurr(inv.computedSgst)}</td>
                                                                <td style={{ textAlign: 'right' }}>{formatCurr(inv.computedCess)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </td>
            </tr>
        );
    };

    return (
        <>
        <PageLoader loading={loading} />
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>Summary</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                    <button className="gstr1-btn-icon" style={{ marginLeft: '10px' }} onClick={handleRefresh}>↻</button>
                </div>
            </div>

            <div className="gstr1-summary-content">
                {/* Header Banner - Cyan */}
                <div className="gstr1-header-banner" style={{ background: '#fff', borderBottom: '2px solid #26a69a' }}>
                    <h2 className="gstr1-summary-title" style={{ color: '#333' }}>GSTR-1/IFF Summary</h2>
                </div>

                {/* Info Block */}
                <div className="gstr1-info-block" style={{ backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
                    <div className="info-column">
                        <p><span>GSTIN</span> - 32AAICD8127A1Z4</p>
                        <p><span>FY</span> - 2025-26</p>
                    </div>
                    <div className="info-column">
                        <p><span>Legal Name</span> - D MIX MEDIA PRIVATE LIMITED</p>
                        <p><span>Tax Period</span> - September</p>
                    </div>
                    <div className="info-column">
                        <p><span>Trade Name</span> -</p>
                        <p><span>Status</span> - Filed</p>
                    </div>
                </div>

                <div className="consolidated-summary-header">
                    <h3>CONSOLIDATED SUMMARY</h3>
                    <span>▲</span>
                </div>

                <div className="summary-table-container">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%', textAlign: 'left' }}>
                                    Description 
                                    <span className="blue-subtext" style={{ cursor: 'pointer', marginLeft: '10px' }}>
                                        [<span onClick={handleExpandAll}>Expand All</span> / <span onClick={handleCollapseAll}>Collapse All</span>]
                                    </span>
                                </th>
                                <th>No. of records</th>
                                <th>Document Type</th>
                                <th>Value (₹)</th>
                                <th>Integrated tax (₹)</th>
                                <th>Central tax (₹)</th>
                                <th>State/UT tax (₹)</th>
                                <th>Cess (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* B2B Section */}
                            <tr className="section-row-main" onClick={() => toggleSection('b2b')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['b2b'] ? 'expanded' : ''}`}>▶</span>
                                    4A - Taxable outward supplies made to registered persons (other than reverse charge supplies) - B2B Regular
                                </td>
                            </tr>
                            {!expandedSections['b2b'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.b2b?.records || 0}</td>
                                    <td>Invoice</td>
                                    <td>{formatCurr(s.b2b?.value)}</td>
                                    <td>{formatCurr(s.b2b?.igst)}</td>
                                    <td>{formatCurr(s.b2b?.cgst)}</td>
                                    <td>{formatCurr(s.b2b?.sgst)}</td>
                                    <td>{formatCurr(s.b2b?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['b2b'] && renderNestedInvoices('b2b')}

                            {/* B2B Reverse Charge */}
                            <tr className="section-row-main" onClick={() => toggleSection('b2bReverse')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['b2bReverse'] ? 'expanded' : ''}`}>▶</span>
                                    4B - Taxable outward supplies made to registered persons attracting reverse charge - B2B Reverse charge
                                </td>
                            </tr>
                            {!expandedSections['b2bReverse'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.b2bReverse?.records || 0}</td>
                                    <td>Invoice</td>
                                    <td>{formatCurr(s.b2bReverse?.value)}</td>
                                    <td>{formatCurr(s.b2bReverse?.igst)}</td>
                                    <td>{formatCurr(s.b2bReverse?.cgst)}</td>
                                    <td>{formatCurr(s.b2bReverse?.sgst)}</td>
                                    <td>{formatCurr(s.b2bReverse?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['b2bReverse'] && renderNestedInvoices('b2bReverse')}

                            {/* B2CL */}
                            <tr className="section-row-main" onClick={() => toggleSection('b2cl')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['b2cl'] ? 'expanded' : ''}`}>▶</span>
                                    5 - Outward inter-state supplies to unregistered persons (Invoice &gt; 2.5 Lakhs) - B2CL (Large)
                                </td>
                            </tr>
                            {!expandedSections['b2cl'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.b2cl?.records || 0}</td>
                                    <td>Invoice</td>
                                    <td>{formatCurr(s.b2cl?.value)}</td>
                                    <td>{formatCurr(s.b2cl?.igst)}</td>
                                    <td className="gray-cell">0.00</td>
                                    <td className="gray-cell">0.00</td>
                                    <td>{formatCurr(s.b2cl?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['b2cl'] && renderNestedInvoices('b2cl')}

                            {/* Exports */}
                            <tr className="section-row-main" onClick={() => toggleSection('exports')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['exports'] ? 'expanded' : ''}`}>▶</span>
                                    6A - Exports
                                </td>
                            </tr>
                            {!expandedSections['exports'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.exports?.records || 0}</td>
                                    <td>Invoice</td>
                                    <td>{formatCurr(s.exports?.value)}</td>
                                    <td>{formatCurr(s.exports?.igst)}</td>
                                    <td className="gray-cell">0.00</td>
                                    <td className="gray-cell">0.00</td>
                                    <td>{formatCurr(s.exports?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['exports'] && renderNestedInvoices('exports')}

                            {/* SEZ */}
                            <tr className="section-row-main" onClick={() => toggleSection('sez')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['sez'] ? 'expanded' : ''}`}>▶</span>
                                    6B - Supplies made to SEZ unit or SEZ developer - SEZWP/SEZWOP
                                </td>
                            </tr>
                            {!expandedSections['sez'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.sez?.records || 0}</td>
                                    <td>Invoice</td>
                                    <td>{formatCurr(s.sez?.value)}</td>
                                    <td>{formatCurr(s.sez?.igst)}</td>
                                    <td className="gray-cell">0.00</td>
                                    <td className="gray-cell">0.00</td>
                                    <td>{formatCurr(s.sez?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['sez'] && renderNestedInvoices('sez')}

                            {/* Deemed Exports */}
                            <tr className="section-row-main" onClick={() => toggleSection('deemedExports')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['deemedExports'] ? 'expanded' : ''}`}>▶</span>
                                    6C - Deemed Exports - DE
                                </td>
                            </tr>
                            {!expandedSections['deemedExports'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.deemedExports?.records || 0}</td>
                                    <td>Invoice</td>
                                    <td>{formatCurr(s.deemedExports?.value)}</td>
                                    <td>{formatCurr(s.deemedExports?.igst)}</td>
                                    <td>{formatCurr(s.deemedExports?.cgst)}</td>
                                    <td>{formatCurr(s.deemedExports?.sgst)}</td>
                                    <td>{formatCurr(s.deemedExports?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['deemedExports'] && renderNestedInvoices('deemedExports')}

                            {/* B2CS */}
                            <tr className="section-row-main" onClick={() => toggleSection('b2cs')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['b2cs'] ? 'expanded' : ''}`}>▶</span>
                                    7 - Taxable supplies net of note details to unregistered persons - B2CS (Others)
                                </td>
                            </tr>
                            {!expandedSections['b2cs'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.b2cs?.records || 0}</td>
                                    <td>Net Value</td>
                                    <td>{formatCurr(s.b2cs?.value)}</td>
                                    <td>{formatCurr(s.b2cs?.igst)}</td>
                                    <td>{formatCurr(s.b2cs?.cgst)}</td>
                                    <td>{formatCurr(s.b2cs?.sgst)}</td>
                                    <td>{formatCurr(s.b2cs?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['b2cs'] && renderNestedInvoices('b2cs')}

                            {/* CDNR */}
                            <tr className="section-row-main" onClick={() => toggleSection('cdnr')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['cdnr'] ? 'expanded' : ''}`}>▶</span>
                                    9B - Credit / Debit Notes (Registered) - CDNR
                                </td>
                            </tr>
                            {!expandedSections['cdnr'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.cdnr?.records || 0}</td>
                                    <td>Note</td>
                                    <td>{formatCurr(s.cdnr?.value)}</td>
                                    <td>{formatCurr(s.cdnr?.igst)}</td>
                                    <td>{formatCurr(s.cdnr?.cgst)}</td>
                                    <td>{formatCurr(s.cdnr?.sgst)}</td>
                                    <td>{formatCurr(s.cdnr?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['cdnr'] && renderNestedInvoices('cdnr')}

                            {/* CDNUR */}
                            <tr className="section-row-main" onClick={() => toggleSection('cdnur')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['cdnur'] ? 'expanded' : ''}`}>▶</span>
                                    9B - Credit / Debit Notes (Unregistered) - CDNUR
                                </td>
                            </tr>
                            {!expandedSections['cdnur'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.cdnur?.records || 0}</td>
                                    <td>Note</td>
                                    <td>{formatCurr(s.cdnur?.value)}</td>
                                    <td>{formatCurr(s.cdnur?.igst)}</td>
                                    <td>{formatCurr(s.cdnur?.cgst)}</td>
                                    <td>{formatCurr(s.cdnur?.sgst)}</td>
                                    <td>{formatCurr(s.cdnur?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['cdnur'] && renderNestedInvoices('cdnur')}

                            {/* Nil Rated */}
                            <tr className="section-row-main" onClick={() => toggleSection('nilRated')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['nilRated'] ? 'expanded' : ''}`}>▶</span>
                                    8 - Nil rated, exempted and non GST outward supplies
                                </td>
                            </tr>
                            {!expandedSections['nilRated'] && (
                                <tr>
                                    <td colSpan="3">Total</td>
                                    <td>{formatCurr((s.nilRated?.value || 0) + (s.nilRated?.exempted || 0) + (s.nilRated?.nonGst || 0))}</td>
                                    <td className="gray-cell"></td>
                                    <td className="gray-cell"></td>
                                    <td className="gray-cell"></td>
                                    <td className="gray-cell"></td>
                                </tr>
                            )}
                            {expandedSections['nilRated'] && renderNestedInvoices('nilRated')}

                            {/* Adv Tax */}
                            <tr className="section-row-main" onClick={() => toggleSection('advTax')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['advTax'] ? 'expanded' : ''}`}>▶</span>
                                    11A(1), 11A(2) - Tax Liability (Advances Received)
                                </td>
                            </tr>
                            {!expandedSections['advTax'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.advTax?.records || 0}</td>
                                    <td>Advance</td>
                                    <td>{formatCurr(s.advTax?.value)}</td>
                                    <td>{formatCurr(s.advTax?.igst)}</td>
                                    <td>{formatCurr(s.advTax?.cgst)}</td>
                                    <td>{formatCurr(s.advTax?.sgst)}</td>
                                    <td>{formatCurr(s.advTax?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['advTax'] && renderNestedInvoices('advTax')}

                            {/* Adj Advances */}
                            <tr className="section-row-main" onClick={() => toggleSection('adjAdvances')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['adjAdvances'] ? 'expanded' : ''}`}>▶</span>
                                    11B(1), 11B(2) - Adjustment of Advances
                                </td>
                            </tr>
                            {!expandedSections['adjAdvances'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.adjAdvances?.records || 0}</td>
                                    <td>Adjustment</td>
                                    <td>{formatCurr(s.adjAdvances?.value)}</td>
                                    <td>{formatCurr(s.adjAdvances?.igst)}</td>
                                    <td>{formatCurr(s.adjAdvances?.cgst)}</td>
                                    <td>{formatCurr(s.adjAdvances?.sgst)}</td>
                                    <td>{formatCurr(s.adjAdvances?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['adjAdvances'] && renderNestedInvoices('adjAdvances')}

                            {/* HSN Summary */}
                            <tr className="section-row-main" onClick={() => toggleSection('hsn')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['hsn'] ? 'expanded' : ''}`}>▶</span>
                                    12 - HSN-wise summary of outward supplies
                                </td>
                            </tr>
                            {!expandedSections['hsn'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.hsn?.records || 0}</td>
                                    <td>HSN</td>
                                    <td>{formatCurr(s.hsn?.value)}</td>
                                    <td>{formatCurr(s.hsn?.igst)}</td>
                                    <td>{formatCurr(s.hsn?.cgst)}</td>
                                    <td>{formatCurr(s.hsn?.sgst)}</td>
                                    <td>{formatCurr(s.hsn?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['hsn'] && renderNestedInvoices('hsn')}

                            {/* 14 - ECO Supplies */}
                            <tr className="section-row-main" onClick={() => toggleSection('eco')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['eco'] ? 'expanded' : ''}`}>▶</span>
                                    14 - Supplies made through E-Commerce Operators
                                </td>
                            </tr>
                            {!expandedSections['eco'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.eco?.records || 0}</td>
                                    <td>Document</td>
                                    <td>{formatCurr(s.eco?.value)}</td>
                                    <td>{formatCurr(s.eco?.igst)}</td>
                                    <td>{formatCurr(s.eco?.cgst)}</td>
                                    <td>{formatCurr(s.eco?.sgst)}</td>
                                    <td>{formatCurr(s.eco?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['eco'] && renderNestedInvoices('eco')}

                            {/* 15A Section 9(5) */}
                            <tr className="section-row-main" onClick={() => toggleSection('sup95')}>
                                <td colSpan="8">
                                    <span className={`section-arrow ${expandedSections['sup95'] ? 'expanded' : ''}`}>▶</span>
                                    15 - Supplies U/s 9(5) - For Registered Recipients (URP2C/R2R/NR2NR)
                                </td>
                            </tr>
                            {!expandedSections['sup95'] && (
                                <tr>
                                    <td>Total</td>
                                    <td>{s.sup95?.records || 0}</td>
                                    <td>Document</td>
                                    <td>{formatCurr(s.sup95?.value)}</td>
                                    <td>{formatCurr(s.sup95?.igst)}</td>
                                    <td>{formatCurr(s.sup95?.cgst)}</td>
                                    <td>{formatCurr(s.sup95?.sgst)}</td>
                                    <td>{formatCurr(s.sup95?.cess)}</td>
                                </tr>
                            )}
                            {expandedSections['sup95'] && renderNestedInvoices('sup95')}

                            {/* Grand Total */}
                            <tr className="total-row">
                                <td colSpan="3">Total Liability (Outward supplies and Advances)</td>
                                <td>{formatCurr(
                                    (s.b2b?.value || 0) + (s.b2cl?.value || 0) + (s.exports?.value || 0) + 
                                    (s.sez?.value || 0) + (s.deemedExports?.value || 0) + (s.b2cs?.value || 0) + 
                                    (s.advTax?.value || 0) + (s.sup95?.value || 0) + (s.cdnr?.value || 0) + (s.cdnur?.value || 0) +
                                    (s.eco?.value || 0)
                                )}</td>
                                <td>{formatCurr(
                                    (s.b2b?.igst || 0) + (s.b2cl?.igst || 0) + (s.exports?.igst || 0) + 
                                    (s.sez?.igst || 0) + (s.deemedExports?.igst || 0) + (s.b2cs?.igst || 0) + 
                                    (s.advTax?.igst || 0) + (s.sup95?.igst || 0) + (s.cdnr?.igst || 0) + (s.cdnur?.igst || 0) +
                                    (s.eco?.igst || 0)
                                )}</td>
                                <td>{formatCurr(
                                    (s.b2b?.cgst || 0) + (s.deemedExports?.cgst || 0) + (s.b2cs?.cgst || 0) + 
                                    (s.advTax?.cgst || 0) + (s.sup95?.cgst || 0) + (s.cdnr?.cgst || 0) + (s.cdnur?.cgst || 0) +
                                    (s.eco?.cgst || 0)
                                )}</td>
                                <td>{formatCurr(
                                    (s.b2b?.sgst || 0) + (s.deemedExports?.sgst || 0) + (s.b2cs?.sgst || 0) + 
                                    (s.advTax?.sgst || 0) + (s.sup95?.sgst || 0) + (s.cdnr?.sgst || 0) + (s.cdnur?.sgst || 0) +
                                    (s.eco?.sgst || 0)
                                )}</td>
                                <td>{formatCurr(
                                    (s.b2b?.cess || 0) + (s.b2cl?.cess || 0) + (s.exports?.cess || 0) + 
                                    (s.sez?.cess || 0) + (s.deemedExports?.cess || 0) + (s.b2cs?.cess || 0) + 
                                    (s.advTax?.cess || 0) + (s.sup95?.cess || 0) + (s.cdnr?.cess || 0) + (s.cdnur?.cess || 0) +
                                    (s.eco?.cess || 0)
                                )}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="summary-actions-bottom">
                    <button className="btn-summary btn-summary-back" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                    <button 
                        className="btn-summary btn-summary-reset" 
                        onClick={handleReset}
                        disabled={loading}
                        style={{ backgroundColor: '#dc2626', color: 'white' }}
                    >
                        RESET GSTR-1
                    </button>
                    <button className="btn-summary btn-summary-pdf" onClick={() => navigate('/returns/gstr1/pdf-preview?fy=2025-26&month=March')}>DOWNLOAD (PDF)</button>
                    <button 
                        className={`btn-summary btn-summary-file ${hasRecords ? 'active' : ''}`}
                        onClick={handleFileStatement}
                        disabled={!hasRecords}
                    >
                        FILE STATEMENT
                    </button>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
        </div>
        </>
    );
};

export default GSTR1Summary;
