import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GSTR2BPrintPreview = () => {
    const navigate = useNavigate();
    const pdfRef = useRef(null);
    const [summary, setSummary] = useState(null);
    const [profile, setProfile] = useState({
        gstin: '32AAICD8127A1Z4',
        legalName: 'D MIX MEDIA PRIVATE LIMITED',
        tradeName: '',
        arn: 'AA3203261234567',
        arnDate: '15/03/2026',
        stateName: 'Kerala'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPrintData = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                
                // Fetch profile
                try {
                    const profRes = await api.get(`/forms/gstr1-profile/${trn}`);
                    if (profRes.data.success) {
                        setProfile(profRes.data.data);
                    }
                } catch (e) {
                    console.warn("Print preview profile failed to load.");
                }

                // Fetch summary
                const sumRes = await api.get(`/forms/gstr2b-summary/${trn}`);
                if (sumRes.data.success) {
                    setSummary(sumRes.data.data);
                }
            } catch (err) {
                console.error("Print preview failed to load data:", err);
                toast.error("Failed to load PDF preview statement");
            } finally {
                setLoading(false);
            }
        };

        loadPrintData();
    }, []);

    const formatCurr = (val) => {
        if (val === undefined || val === null) return "0.00";
        return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleDownloadPDF = async () => {
        const element = pdfRef.current;
        if (!element) {
            toast.error("PDF content reference not found");
            return;
        }

        const toastId = toast.loading("Generating GSTR-2B portal style PDF...");

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                logging: false
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const gstin = profile?.gstin || '32AAICD8127A1Z4';
            pdf.save(`GSTR2B_AUTO_DRAFTED_${gstin}_March_2025-26.pdf`);
            toast.success("GSTR-2B statement PDF downloaded successfully!", { id: toastId });
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to compile high-resolution PDF download", { id: toastId });
        }
    };

    if (loading) {
        return <div style={{ padding: '100px 50px', textAlign: 'center', fontSize: '18px', fontWeight: 600 }}>Drafting GSTR-2B print sheets...</div>;
    }

    const s = summary || {};
    const itcAvail = s.itcAvailable || { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, recordsList: [] };
    const itcNotAvail = s.itcNotAvailable || { records: 0, value: 0, taxAmount: 0, recordsList: [] };
    const debNotes = s.debitNotes || { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, recordsList: [] };
    const credNotes = s.creditNotes || { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, recordsList: [] };
    const impGoods = s.importGoods || { records: 0, value: 0, igst: 0, recordsList: [] };
    const impServ = s.importServices || { records: 0, value: 0, igst: 0, recordsList: [] };

    // Math
    const netIGST = (itcAvail.igst || 0) + (debNotes.igst || 0) + (impGoods.igst || 0) + (impServ.igst || 0) - (credNotes.igst || 0);
    const netCGST = (itcAvail.cgst || 0) + (debNotes.cgst || 0) - (credNotes.cgst || 0);
    const netSGST = (itcAvail.sgst || 0) + (debNotes.sgst || 0) - (credNotes.sgst || 0);
    const netCess = (itcAvail.cess || 0) + (debNotes.cess || 0) - (credNotes.cess || 0);
    const netTotalITC = netIGST + netCGST + netSGST + netCess;

    return (
        <div className="print-preview-backdrop">
            <Toaster position="top-right" />
            
            {/* Embedded styles for perfect A4 and printing overrides */}
            <style>{`
                .print-preview-backdrop {
                    background: #f1f5f9;
                    min-height: 100vh;
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-sizing: border-box;
                }
                .gstr2b-pdf-content {
                    background: white;
                    color: black;
                    width: 794px; /* A4 width */
                    box-sizing: border-box;
                    overflow: visible !important;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                }
                .print-actions {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    width: 794px;
                    justify-content: space-between;
                }
                .print-btn {
                    padding: 12px 24px;
                    background: #1eb3a6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px rgba(30,179,166,0.15);
                    transition: all 0.2s;
                }
                .print-btn:hover {
                    background: #158b81;
                    transform: translateY(-1px);
                }
                .back-btn {
                    padding: 12px 24px;
                    background: white;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .back-btn:hover {
                    background: #f8fafc;
                }
                
                .print-preview-page {
                    padding: 40px 45px;
                    min-height: 1120px;
                    position: relative;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    border-bottom: 1px dashed #e2e8f0;
                    overflow: hidden;
                    background: white;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 85px;
                    font-weight: 900;
                    color: rgba(226, 232, 240, 0.4);
                    z-index: 0;
                    pointer-events: none;
                    letter-spacing: 12px;
                }

                .pdf-header {
                    border-bottom: 3px solid #1a3a6e;
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    z-index: 10;
                }
                .pdf-header-left h1 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1a3a6e;
                    margin: 0;
                }
                .pdf-header-left p {
                    font-size: 10px;
                    margin: 2px 0 0 0;
                    color: #64748b;
                }
                .pdf-header-right {
                    text-align: right;
                    font-size: 11px;
                    font-weight: 700;
                    color: #1a3a6e;
                }

                .profile-box {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    border: 1px solid #cbd5e1;
                    padding: 12px 16px;
                    background: #f8fafc;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    z-index: 10;
                }
                .profile-item {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .profile-label {
                    font-size: 9.5px;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 600;
                }
                .profile-value {
                    font-size: 12px;
                    font-weight: 700;
                    color: #0f172a;
                }

                .table-section-title {
                    font-size: 12px;
                    font-weight: 800;
                    color: white;
                    background: #1a3a6e;
                    padding: 6px 12px;
                    border-radius: 4px 4px 0 0;
                    text-transform: uppercase;
                    margin: 15px 0 0 0;
                    z-index: 10;
                }
                .pdf-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10.5px;
                    margin-bottom: 15px;
                    z-index: 10;
                }
                .pdf-table th {
                    border: 1px solid #94a3b8;
                    background: #f1f5f9;
                    padding: 6px 8px;
                    font-weight: 700;
                    color: #334155;
                    text-align: left;
                }
                .pdf-table td {
                    border: 1px solid #cbd5e1;
                    padding: 6px 8px;
                    color: #0f172a;
                }
                .pdf-total-row {
                    font-weight: 700;
                    background: #f8fafc;
                }
                .pdf-total-row td {
                    border-top: 2px solid #64748b;
                }

                .verification-section {
                    margin-top: 30px;
                    border: 1px dashed #94a3b8;
                    border-radius: 6px;
                    padding: 15px;
                    background: #fafaf9;
                    z-index: 10;
                }
                .verification-title {
                    font-size: 11px;
                    font-weight: 800;
                    color: #1a3a6e;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }
                .verification-text {
                    font-size: 10px;
                    line-height: 1.5;
                    color: #475569;
                    margin-bottom: 12px;
                    text-align: justify;
                }
                .verification-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1.5fr;
                    gap: 15px;
                }
                .meta-field {
                    border-bottom: 1px solid #cbd5e1;
                    padding-bottom: 4px;
                    font-size: 10.5px;
                }
                .meta-label {
                    font-size: 8.5px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .meta-val {
                    font-weight: 700;
                    color: #1e293b;
                    margin-top: 2px;
                }
                .signature-box {
                    border: 1px solid #cbd5e1;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-style: italic;
                    color: #94a3b8;
                    font-size: 10.5px;
                    border-radius: 4px;
                    background: white;
                }

                .page-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9px;
                    color: #94a3b8;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 8px;
                    z-index: 10;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .gstr2b-pdf-content,
                    .gstr2b-pdf-content * {
                        visibility: visible;
                    }
                    .gstr2b-pdf-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                    }
                    .print-actions {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Actions Panel */}
            <div className="print-actions no-print">
                <button className="back-btn" onClick={() => navigate('/returns/gstr2b/summary')}>
                    ← BACK TO SUMMARY
                </button>
                <button className="print-btn" onClick={handleDownloadPDF}>
                    📥 DOWNLOAD GSTR-2B PDF
                </button>
            </div>

            {/* Programmatic PDF Content Wrap Area */}
            <div ref={pdfRef} className="gstr2b-pdf-content">
                
                {/* Page 1: Profile & Part A ITC Available */}
                <div className="print-preview-page">
                    <div className="watermark">ORIGINAL</div>
                    
                    <div className="pdf-header">
                        <div className="pdf-header-left">
                            <h1>FORM GSTR-2B</h1>
                            <p>[See Rule 60(7)]</p>
                            <p style={{ fontWeight: 'bold', color: '#1a3a6e', marginTop: '2px' }}>Auto-Drafted Input Tax Credit Statement</p>
                        </div>
                        <div className="pdf-header-right">
                            <div>Financial Year: 2025-26</div>
                            <span>Tax Period: March</span>
                        </div>
                    </div>

                    <div className="profile-box">
                        <div className="profile-item">
                            <span className="profile-label">GSTIN of Registered Person</span>
                            <span className="profile-value">{profile.gstin}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Legal Name of Taxpayer</span>
                            <span className="profile-value">{profile.legalName}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Trade Name (if any)</span>
                            <span className="profile-value">{profile.tradeName || 'N/A'}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">ARN & Date of Generation</span>
                            <span className="profile-value">{profile.arn} - {profile.arnDate}</span>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '13px', borderBottom: '2px solid #1a3a6e', paddingBottom: '4px', margin: '0 0 10px 0', color: '#1a3a6e' }}>Consolidated Net Credit Balances</h3>
                    <table className="pdf-table">
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th>Eligible Credit Segment</th>
                                <th>Integrated Tax (₹)</th>
                                <th>Central Tax (₹)</th>
                                <th>State/UT Tax (₹)</th>
                                <th>Cess (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Part A: Inward Supplies (Available)</td>
                                <td>{formatCurr(itcAvail.igst)}</td>
                                <td>{formatCurr(itcAvail.cgst)}</td>
                                <td>{formatCurr(itcAvail.sgst)}</td>
                                <td>{formatCurr(itcAvail.cess)}</td>
                            </tr>
                            <tr>
                                <td>Part A: Debit Notes Adjustments</td>
                                <td>{formatCurr(debNotes.igst)}</td>
                                <td>{formatCurr(debNotes.cgst)}</td>
                                <td>{formatCurr(debNotes.sgst)}</td>
                                <td>{formatCurr(debNotes.cess)}</td>
                            </tr>
                            <tr style={{ color: '#ef4444' }}>
                                <td>Part A: Credit Notes Reductions</td>
                                <td>({formatCurr(credNotes.igst)})</td>
                                <td>({formatCurr(credNotes.cgst)})</td>
                                <td>({formatCurr(credNotes.sgst)})</td>
                                <td>({formatCurr(credNotes.cess)})</td>
                            </tr>
                            <tr>
                                <td>Part C: Imports of Goods & Services</td>
                                <td>{formatCurr((impGoods.igst || 0) + (impServ.igst || 0))}</td>
                                <td>0.00</td>
                                <td>0.00</td>
                                <td>0.00</td>
                            </tr>
                            <tr className="pdf-total-row" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                                <td>NET ELIGIBLE CREDIT STATEMENT BALANCE</td>
                                <td>{formatCurr(netIGST)}</td>
                                <td>{formatCurr(netCGST)}</td>
                                <td>{formatCurr(netSGST)}</td>
                                <td>{formatCurr(netCess)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="table-section-title">Table 1. Inward Supplies from Registered Suppliers - Details</div>
                    <table className="pdf-table">
                        <thead>
                            <tr>
                                <th>Supplier GSTIN</th>
                                <th>Supplier Name</th>
                                <th>Invoice No.</th>
                                <th>Taxable Value (₹)</th>
                                <th>IGST (₹)</th>
                                <th>CGST (₹)</th>
                                <th>SGST (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itcAvail.recordsList.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', color: '#64748b' }}>No eligible invoices declared.</td>
                                </tr>
                            ) : (
                                itcAvail.recordsList.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.supplierGSTIN || r.supplierGstin}</td>
                                        <td>{r.supplierName}</td>
                                        <td>{r.invoiceNo}</td>
                                        <td>{formatCurr(r.taxableValue)}</td>
                                        <td>{formatCurr(r.igst)}</td>
                                        <td>{formatCurr(r.cgst)}</td>
                                        <td>{formatCurr(r.sgst)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="pdf-total-row">
                                <td colSpan="3">Total Table 1 Supplies</td>
                                <td>{formatCurr(itcAvail.value)}</td>
                                <td>{formatCurr(itcAvail.igst)}</td>
                                <td>{formatCurr(itcAvail.cgst)}</td>
                                <td>{formatCurr(itcAvail.sgst)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="page-footer">
                        <span className="page-title-tiny">GST PORTAL - AUTO-DRAFTED GSTR-2B STATEMENT</span>
                        <span>Page 1 of 2</span>
                    </div>
                </div>

                {/* Page 2: Ineligible Credits, Imports & Signatory Verification */}
                <div className="print-preview-page">
                    <div className="watermark">ORIGINAL</div>
                    
                    <div className="pdf-header">
                        <div className="pdf-header-left">
                            <h1>FORM GSTR-2B</h1>
                            <p>[See Rule 60(7)]</p>
                            <p style={{ fontWeight: 'bold', color: '#1a3a6e', marginTop: '2px' }}>Auto-Drafted Input Tax Credit Statement</p>
                        </div>
                        <div className="pdf-header-right">
                            <div>Financial Year: 2025-26</div>
                            <span>Tax Period: March</span>
                        </div>
                    </div>

                    <div className="table-section-title" style={{ backgroundColor: '#ef4444' }}>Table 2. Ineligible / Blocked Credits (Part B Not Available)</div>
                    <table className="pdf-table">
                        <thead>
                            <tr style={{ background: '#fef2f2' }}>
                                <th>Supplier GSTIN</th>
                                <th>Supplier Name</th>
                                <th>Blocked Reason Reference</th>
                                <th>Taxable Value (₹)</th>
                                <th>Blocked Tax (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itcNotAvail.recordsList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No blocked credits declared.</td>
                                </tr>
                            ) : (
                                itcNotAvail.recordsList.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.supplierGSTIN || r.supplierGstin}</td>
                                        <td>{r.supplierName}</td>
                                        <td style={{ color: '#ef4444', fontWeight: 600 }}>{r.reason}</td>
                                        <td>{formatCurr(r.taxableValue)}</td>
                                        <td style={{ color: '#ef4444' }}>{formatCurr(r.taxAmount)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="pdf-total-row">
                                <td colSpan="3">Total Table 2 Supplies</td>
                                <td>{formatCurr(itcNotAvail.value)}</td>
                                <td style={{ color: '#ef4444' }}>{formatCurr(itcNotAvail.taxAmount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="table-section-title" style={{ backgroundColor: '#10b981' }}>Table 5 & 6. Inward Supplies on Import of Goods & Services</div>
                    <table className="pdf-table">
                        <thead>
                            <tr style={{ background: '#f0fdf4' }}>
                                <th>Import Category</th>
                                <th>Reference / No.</th>
                                <th>Port / Country</th>
                                <th>Taxable Value (₹)</th>
                                <th>Integrated Tax (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {impGoods.recordsList.map((r, i) => (
                                <tr key={`g_${i}`}>
                                    <td>Import of Goods (BOE)</td>
                                    <td>BOE No: {r.boeNo}</td>
                                    <td>Port Code: {r.portCode}</td>
                                    <td>{formatCurr(r.taxableValue)}</td>
                                    <td>{formatCurr(r.igst)}</td>
                                </tr>
                            ))}
                            {impServ.recordsList.map((r, i) => (
                                <tr key={`s_${i}`}>
                                    <td>Import of Services</td>
                                    <td>Inv No: {r.invoiceNo}</td>
                                    <td>Country: {r.country}</td>
                                    <td>{formatCurr(r.taxableValue)}</td>
                                    <td>{formatCurr(r.igst)}</td>
                                </tr>
                            ))}
                            {impGoods.recordsList.length === 0 && impServ.recordsList.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No customs imports declared.</td>
                                </tr>
                            )}
                            <tr className="pdf-total-row">
                                <td colSpan="3">Total Table 5 & 6 Imports</td>
                                <td>{formatCurr((impGoods.value || 0) + (impServ.value || 0))}</td>
                                <td>{formatCurr((impGoods.igst || 0) + (impServ.igst || 0))}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Verification block */}
                    <div className="verification-section">
                        <div className="verification-title">Taxpayer Verification Statement</div>
                        <div className="verification-text">
                            I hereby solemnly affirm and declare that the auto-drafted Input Tax Credit (ITC) balance computed in Form GSTR-2B matches the invoice summaries of inward goods and services utilized in our business operations. I verify that blocked credits specified under Section 17(5) of CGST Act have been fully identified and excluded from the net utilization claims filed under the final GSTR-3B statement for this reporting period.
                        </div>
                        <div className="verification-meta">
                            <div className="meta-field">
                                <div className="meta-label">Date of Statement Verification</div>
                                <div className="meta-val">{new Date().toLocaleDateString('en-GB')}</div>
                            </div>
                            <div className="meta-field">
                                <div className="meta-label">Authorized Signatory Name</div>
                                <div className="meta-val">D MIX MEDIA PRIVATE LIMITED</div>
                            </div>
                            <div className="meta-field">
                                <div className="meta-label">Digital signature / seal</div>
                                <div className="signature-box">Signed programmatically via Sandbox</div>
                            </div>
                        </div>
                    </div>

                    <div className="page-footer" style={{ marginTop: 'auto' }}>
                        <span className="page-title-tiny">GST PORTAL - AUTO-DRAFTED GSTR-2B STATEMENT</span>
                        <span>Page 2 of 2</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GSTR2BPrintPreview;
