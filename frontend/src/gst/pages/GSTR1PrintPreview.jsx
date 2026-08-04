import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GSTR1PrintPreview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pdfRef = useRef(null);
    
    const fy = searchParams.get('fy') || '2025-26';
    const month = searchParams.get('month') || 'March';
    const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Profile
                const profileRes = await api.get(`/forms/gstr1-profile/${trn}`);
                if (profileRes.data?.success) {
                    setProfile(profileRes.data.data);
                }

                // 2. Fetch Summary
                const summaryRes = await api.get(`/forms/gstr1-summary/${trn}`);
                if (summaryRes.data?.success) {
                    setSummary(summaryRes.data.data);
                }
            } catch (err) {
                console.error("Error loading GSTR-1 PDF data:", err);
                toast.error("Failed to load GSTR-1 records. Using fallback values.");
                // Set default/empty profile & summary for safety
                setProfile({
                    gstin: '32AAICD8127A1Z4',
                    legalName: 'D MIX MEDIA PRIVATE LIMITED',
                    tradeName: 'D MIX MEDIA',
                    arn: 'AA3203260112234',
                    arnDate: '15/03/2026',
                    pan: 'AAICD8127A',
                    stateName: 'Kerala',
                    stateCode: '32'
                });
                setSummary({
                    b2b: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    b2bReverse: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    b2cl: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    exports: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    sez: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    deemedExports: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    b2cs: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    nilRated: { records: 0, value: 0, exempted: 0, nonGst: 0 },
                    cdnr: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    cdnur: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    advTax: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    adjAdvances: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    hsn: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    docs: { records: 0 },
                    eco: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
                    sup95: { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [trn]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
                <style>{`
                    .spinner {
                        border: 4px solid #e2e8f0;
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        border-left-color: #1e3a8a;
                        animation: spin 1s linear infinite;
                        margin-bottom: 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <div className="spinner"></div>
                <h3 style={{ color: '#1e3a8a' }}>Generating GST-Compliant PDF View...</h3>
                <p style={{ color: '#64748b' }}>Consolidating saved GSTR-1 records</p>
            </div>
        );
    }

    const formatVal = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Total Liability Calculations: (Outward + Inward) - Adjustments
    const calcOutward = (field) => {
        return (
            (summary.b2b?.[field] || 0) +
            (summary.b2cl?.[field] || 0) +
            (summary.exports?.[field] || 0) +
            (summary.sez?.[field] || 0) +
            (summary.deemedExports?.[field] || 0) +
            (summary.b2cs?.[field] || 0) +
            (summary.advTax?.[field] || 0) +
            (summary.eco?.[field] || 0) +
            (summary.sup95?.[field] || 0)
        );
    };

    const calcInward = (field) => {
        return (summary.b2bReverse?.[field] || 0);
    };

    const calcAdjustments = (field) => {
        return (
            (summary.adjAdvances?.[field] || 0) +
            (summary.cdnr?.[field] || 0) +
            (summary.cdnur?.[field] || 0)
        );
    };

    const getNetLiability = (field) => {
        const out = calcOutward(field);
        const inv = calcInward(field);
        const adj = calcAdjustments(field);
        return (out + inv) - adj;
    };

    const handleDownloadPDF = async () => {
        const element = pdfRef.current;
        if (!element) {
            toast.error("PDF content not found");
            return;
        }

        const toastId = toast.loading("Generating GSTR-1 Portal style PDF...");

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
            pdf.save(`GSTR1_${gstin}_${month}_${fy}.pdf`);
            toast.success("GSTR-1 PDF downloaded successfully!", { id: toastId });
        } catch (err) {
            console.error("PDF download error:", err);
            toast.error("Failed to generate PDF download.", { id: toastId });
        }
    };

    return (
        <div className="print-preview-backdrop">
            <Toaster position="top-right" />
            
            {/* Custom Stylesheet */}
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
                .gstr1-pdf-content {
                    background: white;
                    color: black;
                    width: 794px; /* A4 width at 96 DPI */
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
                    background: #1a3a6e;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px rgba(26,58,110,0.15);
                    transition: all 0.2s;
                }
                .print-btn:hover {
                    background: #12284c;
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
                    color: #1e293b;
                }
                .print-preview-page {
                    background: white;
                    width: 100%;
                    height: 1123px; /* A4 height at 96 DPI */
                    padding: 20mm 15mm;
                    position: relative;
                    box-sizing: border-box;
                    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
                    color: #1e293b;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border-bottom: 1px dashed #cbd5e1;
                }
                .print-preview-page:last-child {
                    border-bottom: none;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-40deg);
                    font-size: 110px;
                    font-weight: 900;
                    color: rgba(180, 180, 180, 0.08);
                    text-transform: uppercase;
                    letter-spacing: 12px;
                    pointer-events: none;
                    user-select: none;
                    z-index: 0;
                    white-space: nowrap;
                }
                .pdf-header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 2px solid #1a3a6e;
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                    z-index: 10;
                }
                .pdf-header-left h1 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1a3a6e;
                    margin: 0 0 4px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .pdf-header-left p {
                    font-size: 11px;
                    color: #64748b;
                    margin: 0;
                    font-weight: 500;
                }
                .pdf-header-right {
                    text-align: right;
                }
                .pdf-header-right div {
                    font-size: 12px;
                    font-weight: 700;
                    color: #1a3a6e;
                    margin-bottom: 2px;
                }
                .pdf-header-right span {
                    font-size: 11px;
                    color: #475569;
                }
                
                /* Profile Box */
                .profile-box {
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    background: #f8fafc;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px 20px;
                    z-index: 10;
                }
                .profile-item {
                    display: flex;
                    flex-direction: column;
                }
                .profile-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                    letter-spacing: 0.5px;
                }
                .profile-value {
                    font-size: 12.5px;
                    font-weight: 700;
                    color: #0f172a;
                }

                /* Portal Styles Tables */
                .pdf-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                    z-index: 10;
                    margin-bottom: 16px;
                }
                .pdf-table th {
                    background: #1a3a6e;
                    color: white;
                    text-transform: uppercase;
                    font-weight: 700;
                    padding: 8px 6px;
                    border: 1px solid #1e293b;
                    font-size: 10px;
                    letter-spacing: 0.2px;
                    text-align: center;
                }
                .pdf-table td {
                    border: 1px solid #cbd5e1;
                    padding: 6px 8px;
                    vertical-align: middle;
                }
                .section-header-row {
                    background: #f7f5ee !important;
                    font-weight: 700;
                    color: #1e293b;
                }
                .section-header-cell {
                    font-size: 10.5px;
                    letter-spacing: 0.3px;
                }
                .text-right {
                    text-align: right;
                }
                .text-center {
                    text-align: center;
                }
                .font-bold {
                    font-weight: 700;
                }

                /* Highlighted Row Styles */
                .summary-header-row {
                    background: #fff3e0 !important;
                    font-weight: 800;
                    color: #e65100;
                }
                .orange-summary-row {
                    background: #e65100 !important;
                    color: white !important;
                    font-weight: 800;
                }
                .orange-summary-row td {
                    border-color: #d84315;
                    padding: 10px 8px;
                    font-size: 12px;
                }

                /* Signatory Verification Block */
                .verification-section {
                    margin-top: auto;
                    border: 1px dashed #94a3b8;
                    border-radius: 8px;
                    padding: 16px;
                    background: #fafaf9;
                    z-index: 10;
                }
                .verification-title {
                    font-size: 12px;
                    font-weight: 800;
                    color: #1a3a6e;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                }
                .verification-text {
                    font-size: 10.5px;
                    line-height: 1.5;
                    color: #475569;
                    margin-bottom: 16px;
                    text-align: justify;
                }
                .verification-meta {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr) 1.5fr;
                    gap: 15px;
                }
                .meta-field {
                    border-bottom: 1px solid #cbd5e1;
                    padding-bottom: 4px;
                    font-size: 11px;
                }
                .meta-label {
                    font-size: 9px;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .meta-val {
                    font-weight: 700;
                    color: #1e293b;
                    margin-top: 2px;
                    min-height: 16px;
                }
                
                .signature-box {
                    border: 1px solid #cbd5e1;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-style: italic;
                    color: #94a3b8;
                    font-size: 11px;
                    border-radius: 4px;
                    background: white;
                }

                .page-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9.5px;
                    color: #94a3b8;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 8px;
                    z-index: 10;
                }
                .page-title-tiny {
                    font-weight: 700;
                    color: #64748b;
                }

                /* Print specific styling overrides */
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .gstr1-pdf-content,
                    .gstr1-pdf-content * {
                        visibility: visible;
                    }
                    .gstr1-pdf-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        box-shadow: none;
                    }
                    .print-actions {
                        display: none !important;
                    }
                    .print-preview-page {
                        border-bottom: none;
                        page-break-after: always;
                        height: 297mm;
                        width: 210mm;
                        box-sizing: border-box;
                    }
                    .print-preview-page:last-child {
                        page-break-after: avoid;
                    }
                }
            `}</style>

            {/* Actions Bar */}
            <div className="print-actions no-print">
                <button className="back-btn" onClick={() => navigate('/returns/gstr1/summary')}>
                    ← BACK TO SUMMARY
                </button>
                <button className="print-btn" onClick={handleDownloadPDF}>
                    📥 DOWNLOAD GSTR-1 PDF
                </button>
            </div>

            <div ref={pdfRef} className="gstr1-pdf-content">
                {/* Page 1: Header, Profile & Outward Supplies Part 1 */}
                <div className="print-preview-page">
                <div className="watermark">ORIGINAL</div>
                
                <div className="pdf-header">
                    <div className="pdf-header-left">
                        <h1>FORM GSTR-1</h1>
                        <p>[See Rule 59(1)]</p>
                        <p style={{ marginTop: '2px', fontWeight: 'bold' }}>Details of outward supplies of goods or services</p>
                    </div>
                    <div className="pdf-header-right">
                        <div>Financial Year: {fy}</div>
                        <span>Tax Period: {month}</span>
                    </div>
                </div>

                {/* Taxpayer Details */}
                <div className="profile-box">
                    <div className="profile-item">
                        <span className="profile-label">GSTIN of Registered Taxpayer</span>
                        <span className="profile-value">{profile?.gstin}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Legal Name of Registered Person</span>
                        <span className="profile-value">{profile?.legalName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Trade Name (if any)</span>
                        <span className="profile-value">{profile?.tradeName || 'N/A'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">ARN (Application Reference Number)</span>
                        <span className="profile-value">{profile?.arn}</span>
                    </div>
                    <div className="profile-item" style={{ gridColumn: 'span 2' }}>
                        <span className="profile-label">ARN Date</span>
                        <span className="profile-value">{profile?.arnDate}</span>
                    </div>
                </div>

                {/* Outward Supplies Tables Part A */}
                <h4 style={{ color: '#1a3a6e', marginTop: '0', marginBottom: '8px', fontSize: '12px', borderBottom: '1px solid #1a3a6e', paddingBottom: '4px' }}>
                    1. Details of Outward Supplies (Outward Liability & Inward Reverse Charge)
                </h4>
                
                <table className="pdf-table">
                    <thead>
                        <tr>
                            <th style={{ width: '38%' }}>Section & Description</th>
                            <th style={{ width: '10%' }}>Records</th>
                            <th style={{ width: '12%' }}>Doc Type</th>
                            <th style={{ width: '10%' }}>Value (₹)</th>
                            <th style={{ width: '10%' }}>IGST (₹)</th>
                            <th style={{ width: '10%' }}>CGST (₹)</th>
                            <th style={{ width: '10%' }}>SGST (₹)</th>
                            <th style={{ width: '10%' }}>Cess (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 4A - B2B Regular */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">4A. Outward supplies other than reverse charge (B2B Regular)</td>
                        </tr>
                        <tr>
                            <td>Supplies to Registered Persons (B2B Invoices)</td>
                            <td className="text-center font-bold">{summary.b2b?.records || 0}</td>
                            <td className="text-center">Invoices</td>
                            <td className="text-right">{formatVal(summary.b2b?.value)}</td>
                            <td className="text-right">{formatVal(summary.b2b?.igst)}</td>
                            <td className="text-right">{formatVal(summary.b2b?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.b2b?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.b2b?.cess)}</td>
                        </tr>

                        {/* 4B - B2B Reverse Charge */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">4B. Supplies attracting Reverse Charge u/s 9(3) / 9(4)</td>
                        </tr>
                        <tr>
                            <td>Inward supplies attracting Reverse Charge (B2B RCM)</td>
                            <td className="text-center font-bold">{summary.b2bReverse?.records || 0}</td>
                            <td className="text-center">Invoices</td>
                            <td className="text-right">{formatVal(summary.b2bReverse?.value)}</td>
                            <td className="text-right">{formatVal(summary.b2bReverse?.igst)}</td>
                            <td className="text-right">{formatVal(summary.b2bReverse?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.b2bReverse?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.b2bReverse?.cess)}</td>
                        </tr>

                        {/* 5 - B2CL */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">5. Taxable outward inter-state supplies to unregistered persons (B2C Large)</td>
                        </tr>
                        <tr>
                            <td>B2C Large Supplies (Invoice value &gt; ₹2.5 Lakhs)</td>
                            <td className="text-center font-bold">{summary.b2cl?.records || 0}</td>
                            <td className="text-center">Invoices</td>
                            <td className="text-right">{formatVal(summary.b2cl?.value)}</td>
                            <td className="text-right">{formatVal(summary.b2cl?.igst)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(summary.b2cl?.cess)}</td>
                        </tr>

                        {/* 6A - Exports */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">6A. Export supplies (EXPWP / EXPWOP)</td>
                        </tr>
                        <tr>
                            <td>Export Supplies declared</td>
                            <td className="text-center font-bold">{summary.exports?.records || 0}</td>
                            <td className="text-center">Invoices</td>
                            <td className="text-right">{formatVal(summary.exports?.value)}</td>
                            <td className="text-right">{formatVal(summary.exports?.igst)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(summary.exports?.cess)}</td>
                        </tr>

                        {/* 6B - SEZ Supplies */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">6B. Supplies made to SEZ Unit or SEZ Developer</td>
                        </tr>
                        <tr>
                            <td>SEZ Supplies (with/without payment)</td>
                            <td className="text-center font-bold">{summary.sez?.records || 0}</td>
                            <td className="text-center">Invoices</td>
                            <td className="text-right">{formatVal(summary.sez?.value)}</td>
                            <td className="text-right">{formatVal(summary.sez?.igst)}</td>
                            <td className="text-right">{formatVal(summary.sez?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.sez?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.sez?.cess)}</td>
                        </tr>

                        {/* 6C - Deemed Exports */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">6C. Deemed Exports supplies</td>
                        </tr>
                        <tr>
                            <td>Deemed Exports registered</td>
                            <td className="text-center font-bold">{summary.deemedExports?.records || 0}</td>
                            <td className="text-center">Invoices</td>
                            <td className="text-right">{formatVal(summary.deemedExports?.value)}</td>
                            <td className="text-right">{formatVal(summary.deemedExports?.igst)}</td>
                            <td className="text-right">{formatVal(summary.deemedExports?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.deemedExports?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.deemedExports?.cess)}</td>
                        </tr>

                        {/* 7 - B2CS */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">7. Taxable supplies to unregistered persons (B2C Small)</td>
                        </tr>
                        <tr>
                            <td>B2C Small supplies (Other than Section 5)</td>
                            <td className="text-center font-bold">{summary.b2cs?.records || 0}</td>
                            <td className="text-center">Supplies</td>
                            <td className="text-right">{formatVal(summary.b2cs?.value)}</td>
                            <td className="text-right">{formatVal(summary.b2cs?.igst)}</td>
                            <td className="text-right">{formatVal(summary.b2cs?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.b2cs?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.b2cs?.cess)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="page-footer">
                    <span className="page-title-tiny">GST PORTAL - GSTR-1 FORM</span>
                    <span>Page 1 of 3</span>
                </div>
            </div>

            {/* Page 2: Nil Rated, CDNR, Advances, HSN, Docs & Others */}
            <div className="print-preview-page">
                <div className="watermark">ORIGINAL</div>
                
                <div className="pdf-header">
                    <div className="pdf-header-left">
                        <h1>FORM GSTR-1</h1>
                        <p>[See Rule 59(1)]</p>
                    </div>
                    <div className="pdf-header-right">
                        <div>Financial Year: {fy}</div>
                        <span>Tax Period: {month}</span>
                    </div>
                </div>

                <h4 style={{ color: '#1a3a6e', marginTop: '0', marginBottom: '8px', fontSize: '12px', borderBottom: '1px solid #1a3a6e', paddingBottom: '4px' }}>
                    2. Details of Other outward supplies, HSN, Advances & Credit/Debit Notes
                </h4>

                <table className="pdf-table">
                    <thead>
                        <tr>
                            <th style={{ width: '38%' }}>Section & Description</th>
                            <th style={{ width: '10%' }}>Records</th>
                            <th style={{ width: '12%' }}>Doc Type</th>
                            <th style={{ width: '10%' }}>Value (₹)</th>
                            <th style={{ width: '10%' }}>IGST (₹)</th>
                            <th style={{ width: '10%' }}>CGST (₹)</th>
                            <th style={{ width: '10%' }}>SGST (₹)</th>
                            <th style={{ width: '10%' }}>Cess (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* 8 - Nil Rated */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">8. Nil rated, exempted and non-GST outward supplies</td>
                        </tr>
                        <tr>
                            <td>Nil Rated / Exempted / Non-GST supplies</td>
                            <td className="text-center font-bold">{summary.nilRated?.records || 0}</td>
                            <td className="text-center">Consolidated</td>
                            <td className="text-right">{formatVal((summary.nilRated?.value || 0) + (summary.nilRated?.exempted || 0) + (summary.nilRated?.nonGst || 0))}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>

                        {/* 9A - Amended Outward Supplies */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">9A. Amended Outward Supplies (Amended B2B, B2CL, Exports)</td>
                        </tr>
                        <tr>
                            <td>Amendments declared in GSTR-1</td>
                            <td className="text-center font-bold">0</td>
                            <td className="text-center">Amendments</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>

                        {/* 9B - CDNR */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">9B. Credit or Debit Notes registered u/s 34 (CDNR)</td>
                        </tr>
                        <tr>
                            <td>Credit / Debit Notes issued to Registered Persons</td>
                            <td className="text-center font-bold">{summary.cdnr?.records || 0}</td>
                            <td className="text-center">Notes</td>
                            <td className="text-right">{formatVal(summary.cdnr?.value)}</td>
                            <td className="text-right">{formatVal(summary.cdnr?.igst)}</td>
                            <td className="text-right">{formatVal(summary.cdnr?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.cdnr?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.cdnr?.cess)}</td>
                        </tr>

                        {/* 9B - CDNUR */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">9B. Credit or Debit Notes unregistered u/s 34 (CDNUR)</td>
                        </tr>
                        <tr>
                            <td>Credit / Debit Notes issued to Unregistered Persons</td>
                            <td className="text-center font-bold">{summary.cdnur?.records || 0}</td>
                            <td className="text-center">Notes</td>
                            <td className="text-right">{formatVal(summary.cdnur?.value)}</td>
                            <td className="text-right">{formatVal(summary.cdnur?.igst)}</td>
                            <td className="text-right">{formatVal(summary.cdnur?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.cdnur?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.cdnur?.cess)}</td>
                        </tr>

                        {/* 9C - CDNRA / CDNURA */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">9C. Amended Credit or Debit Notes registered/unregistered</td>
                        </tr>
                        <tr>
                            <td>Amendments to CDNR and CDNUR Notes</td>
                            <td className="text-center font-bold">0</td>
                            <td className="text-center">Amendments</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>

                        {/* 10 - Amendment B2CS */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">10. Amended supplies to unregistered persons (B2CS Amendments)</td>
                        </tr>
                        <tr>
                            <td>Amendments to B2C Small supplies</td>
                            <td className="text-center font-bold">0</td>
                            <td className="text-center">Amendments</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>

                        {/* 11A - Advances Received */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">11A. Advances received for which invoice has not been issued</td>
                        </tr>
                        <tr>
                            <td>Tax Liability on Advances Received (AdvTax)</td>
                            <td className="text-center font-bold">{summary.advTax?.records || 0}</td>
                            <td className="text-center">Advances</td>
                            <td className="text-right">{formatVal(summary.advTax?.value)}</td>
                            <td className="text-right">{formatVal(summary.advTax?.igst)}</td>
                            <td className="text-right">{formatVal(summary.advTax?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.advTax?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.advTax?.cess)}</td>
                        </tr>

                        {/* 11B - Advances Adjusted */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">11B. Adjustment of advances declared in earlier tax period</td>
                        </tr>
                        <tr>
                            <td>Adjustment of Advances (AdjAdvances)</td>
                            <td className="text-center font-bold">{summary.adjAdvances?.records || 0}</td>
                            <td className="text-center">Adjustments</td>
                            <td className="text-right">{formatVal(summary.adjAdvances?.value)}</td>
                            <td className="text-right">{formatVal(summary.adjAdvances?.igst)}</td>
                            <td className="text-right">{formatVal(summary.adjAdvances?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.adjAdvances?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.adjAdvances?.cess)}</td>
                        </tr>

                        {/* 12 - HSN Summary */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">12. HSN-wise summary of outward supplies</td>
                        </tr>
                        <tr>
                            <td>Outward supplies declared by HSN Code</td>
                            <td className="text-center font-bold">{summary.hsn?.records || 0}</td>
                            <td className="text-center">HSN Items</td>
                            <td className="text-right">{formatVal(summary.hsn?.value)}</td>
                            <td className="text-right">{formatVal(summary.hsn?.igst)}</td>
                            <td className="text-right">{formatVal(summary.hsn?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.hsn?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.hsn?.cess)}</td>
                        </tr>

                        {/* 13 - Docs Issued */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">13. Documents issued during the tax period</td>
                        </tr>
                        <tr>
                            <td>Net count of documents issued</td>
                            <td className="text-center font-bold">{summary.docs?.records || 0}</td>
                            <td className="text-center">Documents</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>

                        {/* 14 - ECO Supplies */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">14. Outward supplies through E-Commerce Operator (ECO)</td>
                        </tr>
                        <tr>
                            <td>Supplies through E-Commerce Operators (TCS)</td>
                            <td className="text-center font-bold">{summary.eco?.records || 0}</td>
                            <td className="text-center">ECO Records</td>
                            <td className="text-right">{formatVal(summary.eco?.value)}</td>
                            <td className="text-right">{formatVal(summary.eco?.igst)}</td>
                            <td className="text-right">{formatVal(summary.eco?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.eco?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.eco?.cess)}</td>
                        </tr>

                        {/* 14A - ECO Amendments */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">14A. Amended supplies through ECO operator</td>
                        </tr>
                        <tr>
                            <td>Amendments to ECO supplies</td>
                            <td className="text-center font-bold">0</td>
                            <td className="text-center">Amendments</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>

                        {/* 15 - Sup95 */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">15. Supplies made under Section 9(5) of CGST Act</td>
                        </tr>
                        <tr>
                            <td>ECO Supplies paid under Section 9(5) (ECO Pay)</td>
                            <td className="text-center font-bold">{summary.sup95?.records || 0}</td>
                            <td className="text-center">Transactions</td>
                            <td className="text-right">{formatVal(summary.sup95?.value)}</td>
                            <td className="text-right">{formatVal(summary.sup95?.igst)}</td>
                            <td className="text-right">{formatVal(summary.sup95?.cgst)}</td>
                            <td className="text-right">{formatVal(summary.sup95?.sgst)}</td>
                            <td className="text-right">{formatVal(summary.sup95?.cess)}</td>
                        </tr>

                        {/* 15A/15B - Sup95 Amendments */}
                        <tr className="section-header-row">
                            <td colSpan="8" className="section-header-cell">15A/15B. Amended supplies u/s 9(5)</td>
                        </tr>
                        <tr>
                            <td>Amendments to Section 9(5) supplies</td>
                            <td className="text-center font-bold">0</td>
                            <td className="text-center">Amendments</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                            <td className="text-right">{formatVal(0)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="page-footer">
                    <span className="page-title-tiny">GST PORTAL - GSTR-1 FORM</span>
                    <span>Page 2 of 3</span>
                </div>
            </div>

            {/* Page 3: Final Liability Summary & Verification */}
            <div className="print-preview-page">
                <div className="watermark">ORIGINAL</div>
                
                <div className="pdf-header">
                    <div className="pdf-header-left">
                        <h1>FORM GSTR-1</h1>
                        <p>[See Rule 59(1)]</p>
                    </div>
                    <div className="pdf-header-right">
                        <div>Financial Year: {fy}</div>
                        <span>Tax Period: {month}</span>
                    </div>
                </div>

                {/* Liability Breakdown Subtable */}
                <h4 style={{ color: '#1a3a6e', marginTop: '0', marginBottom: '8px', fontSize: '12px', borderBottom: '1px solid #1a3a6e', paddingBottom: '4px' }}>
                    3. GSTR-1 Tax Liability Summary Breakdown
                </h4>
                
                <table className="pdf-table" style={{ marginBottom: '24px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Liability Component Breakdown</th>
                            <th style={{ width: '12%' }}>Value (₹)</th>
                            <th style={{ width: '12%' }}>IGST (₹)</th>
                            <th style={{ width: '12%' }}>CGST (₹)</th>
                            <th style={{ width: '12%' }}>SGST (₹)</th>
                            <th style={{ width: '12%' }}>Cess (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="font-bold">A. Total Outward Supplies Liability (+)</td>
                            <td className="text-right font-bold">{formatVal(calcOutward('value'))}</td>
                            <td className="text-right">{formatVal(calcOutward('igst'))}</td>
                            <td className="text-right">{formatVal(calcOutward('cgst'))}</td>
                            <td className="text-right">{formatVal(calcOutward('sgst'))}</td>
                            <td className="text-right">{formatVal(calcOutward('cess'))}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">B. Total Inward Reverse Charge Liability (+)</td>
                            <td className="text-right font-bold">{formatVal(calcInward('value'))}</td>
                            <td className="text-right">{formatVal(calcInward('igst'))}</td>
                            <td className="text-right">{formatVal(calcInward('cgst'))}</td>
                            <td className="text-right">{formatVal(calcInward('sgst'))}</td>
                            <td className="text-right">{formatVal(calcInward('cess'))}</td>
                        </tr>
                        <tr>
                            <td className="font-bold">C. Total Adjustments & Credit Notes (-)</td>
                            <td className="text-right font-bold">{formatVal(calcAdjustments('value'))}</td>
                            <td className="text-right">{formatVal(calcAdjustments('igst'))}</td>
                            <td className="text-right">{formatVal(calcAdjustments('cgst'))}</td>
                            <td className="text-right">{formatVal(calcAdjustments('sgst'))}</td>
                            <td className="text-right">{formatVal(calcAdjustments('cess'))}</td>
                        </tr>
                        
                        {/* Dynamic absolute final liability row in Orange */}
                        <tr className="orange-summary-row">
                            <td className="font-bold">NET GSTR-1 FINAL TAX LIABILITY (A + B - C)</td>
                            <td className="text-right font-bold">{formatVal(getNetLiability('value'))}</td>
                            <td className="text-right font-bold">{formatVal(getNetLiability('igst'))}</td>
                            <td className="text-right font-bold">{formatVal(getNetLiability('cgst'))}</td>
                            <td className="text-right font-bold">{formatVal(getNetLiability('sgst'))}</td>
                            <td className="text-right font-bold">{formatVal(getNetLiability('cess'))}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Verification block */}
                <div className="verification-section">
                    <div className="verification-title">Verification & Authorized Signatory Declarations</div>
                    <p className="verification-text">
                        I hereby solemnly affirm and declare that the information given herein above is true and correct to the
                        best of my knowledge and belief and nothing has been concealed therefrom. I declare that the details of
                        outward supplies of goods or services declared under Form GSTR-1 for the tax period matches the actual business
                        books of account, and I authorize the submission of this return to the Goods and Services Tax Network (GSTN).
                    </p>
                    
                    <div className="verification-meta">
                        <div className="profile-item">
                            <span className="profile-label">Place of Declaration</span>
                            <span className="profile-value" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginTop: '2px' }}>
                                Kerala, India
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Date of Submission</span>
                            <span className="profile-value" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginTop: '2px' }}>
                                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Signatory Status / Designation</span>
                            <span className="profile-value" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginTop: '2px' }}>
                                Authorized Signatory
                            </span>
                        </div>
                        
                        <div className="profile-item" style={{ gridColumn: 'span 2' }}>
                            <span className="profile-label">Name of Signatory</span>
                            <span className="profile-value" style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginTop: '2px' }}>
                                {profile?.legalName}
                            </span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Authorized Signature / EVC</span>
                            <div className="signature-box">
                                Digitally Signed by {profile?.legalName}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-footer">
                    <span className="page-title-tiny">GST PORTAL - GSTR-1 FORM</span>
                    <span>Page 3 of 3</span>
                </div>
                </div>
            </div>
        </div>
    );
};

export default GSTR1PrintPreview;
