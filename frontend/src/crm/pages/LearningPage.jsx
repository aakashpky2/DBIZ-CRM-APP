import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  HelpCircle, 
  Bell, 
  Calendar, 
  CheckCircle2, 
  Download, 
  ArrowLeft, 
  Star, 
  Clock, 
  Globe, 
  MessageSquare,
  Bookmark,
  Share2,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import VideoCard from '../components/VideoCard';
import AddEditVideoModal from '../components/AddEditVideoModal';
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../services/VideoService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCanManageVideos } from '../hooks/useCanManageVideos';

// Placeholder: videos will be fetched from backend
const CATEGORY_MAP = {
  'gst': 'GST',
  'income-tax': 'Income Tax',
  'roc-compliance': 'ROC Compliance',
  'company-registration': 'Company Registration',
  'trademark': 'Trademark',
  'payroll-hr': 'Payroll & HR',
  'accounting': 'Accounting',
  'audit': 'Audit & Assurance'
};

// Comprehensive mock data for the 8 services
const SERVICES_DATA = {
  'gst': {
    title: 'GST (Goods & Services Tax)',
    description: 'Master indirect taxation, registrations, GSTR-1 & 3B return filing, and notice management.',
    iconColor: 'bg-blue-500 text-white',
    overview: 'The Goods and Services Tax (GST) is a comprehensive, multi-stage, destination-based tax that is levied on every value addition in India. This program provides deep technical mastery over registration, regular filing, handling department notices, and credit reconciliations.',
    modules: [
      { id: 1, title: 'Introduction to Indirect Taxes & GST', duration: '45 mins', level: 'Beginner', completed: true },
      { id: 2, title: 'GST Registration Process & SPICe+ Integration', duration: '1.2 hours', level: 'Intermediate', completed: true },
      { id: 3, title: 'Composition Scheme vs Regular Taxpayer Rules', duration: '1 hour', level: 'Intermediate', completed: false },
      { id: 4, title: 'How to file GSTR-1, GSTR-3B & GSTR-9 (Annual)', duration: '2.5 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'GST Registration Walkthrough (MCA V3 Portal)', duration: '18:45', rating: 4.8 },
      { id: 2, title: 'GSTR-3B Filing Step-by-Step Guide', duration: '22:10', rating: 4.9 },
      { id: 3, title: 'Responding to GST DRC-01 Notice & Tax Mismatches', duration: '15:30', rating: 4.7 }
    ],
    forms: [
      { code: 'REG-01', name: 'Application for Registration', mca: 'GST Portal' },
      { code: 'GSTR-1', name: 'Details of Outward Supplies', mca: 'GST Portal' },
      { code: 'GSTR-3B', name: 'Monthly Self-Assessed Tax Summary', mca: 'GST Portal' }
    ],
    templates: [
      { name: 'Automated GST Invoice Excel Sheet', size: '2.4 MB', downloads: '14,800' },
      { name: 'Input Tax Credit (ITC) Reconciliation Sheet', size: '4.1 MB', downloads: '9,230' }
    ],
    faqs: [
      { q: 'Who is liable to register under GST?', a: 'Any business with an annual turnover exceeding ₹40 Lakhs (₹20 Lakhs for service providers and special category states) must register for GST.' },
      { q: 'What is the penalty for late filing of GSTR-3B?', a: 'The late fee is ₹50 per day (₹20 per day for Nil filings) up to a maximum cap of ₹5,000 per return.' }
    ],
    updates: [
      { title: 'Due Date Extended for GSTR-9/9C Annual Returns', date: 'May 20, 2026', type: 'Extension' },
      { title: 'GST Council Recommends 12% Uniform Rate on All Milk Cans', date: 'May 12, 2026', type: 'Notification' }
    ]
  },
  'income-tax': {
    title: 'Income Tax',
    description: 'Learn about direct taxes, salaries, presumptive tax under 44AD, and filing ITR-1 to 4.',
    iconColor: 'bg-emerald-500 text-white',
    overview: 'Direct taxation forms the bedrock of individual and corporate compliance. This module equips you to analyze components of salaries, structure business presumptive taxes, maximize deductions, and perform end-to-end ITR filings.',
    modules: [
      { id: 1, title: 'Basics of Direct Tax & Resident Status', duration: '50 mins', level: 'Beginner', completed: true },
      { id: 2, title: 'Income from Salaries & House Property', duration: '1.5 hours', level: 'Intermediate', completed: false },
      { id: 3, title: 'Business Presumptive Taxation (Sec 44AD/44ADA)', duration: '1.2 hours', level: 'Intermediate', completed: false },
      { id: 4, title: 'Deductions (80C, 80D, 80G) & ITR 1/2/3/4 Filing', duration: '2.8 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'How to File ITR-1 Sahaj in 10 Minutes', duration: '12:15', rating: 4.9 },
      { id: 2, title: 'TDS Returns and Form 16/26AS Reconciliation', duration: '20:45', rating: 4.8 },
      { id: 3, title: 'Tax Planning Strategies under Sec 80C', duration: '14:20', rating: 4.6 }
    ],
    forms: [
      { code: 'ITR-1', name: 'Sahaj Individual Income Tax Return', mca: 'IT Portal' },
      { code: 'ITR-4', name: 'Sugam Presumptive Business Return', mca: 'IT Portal' },
      { code: 'Form 16', name: 'TDS Certificate on Salary', mca: 'Employer Issued' }
    ],
    templates: [
      { name: 'Income Tax Slab Calculator (Old vs New Regime)', size: '1.8 MB', downloads: '24,200' },
      { name: 'Salary Tax Optimization Matrix', size: '3.0 MB', downloads: '11,450' }
    ],
    faqs: [
      { q: 'Is presumptive tax mandatory for retail shop owners?', a: 'No, it is an optional scheme under Section 44AD. If chosen, you do not need to maintain books of accounts and can declare 6% or 8% of gross turnover as profit.' },
      { q: 'What is the rebate under Section 87A?', a: 'Under the new tax regime, individuals with taxable income up to ₹7 Lakhs receive a full rebate, rendering their tax liability zero.' }
    ],
    updates: [
      { title: 'New Direct Tax Slabs Applicable from FY 2026-27', date: 'May 18, 2026', type: 'Circular' },
      { title: 'TDS Rates Reduced on Technical Services Contracts', date: 'May 05, 2026', type: 'Amendment' }
    ]
  },
  'roc-compliance': {
    title: 'ROC Compliance',
    description: 'Understand annual return filing, company secretarial works, and MCA v3 forms.',
    iconColor: 'bg-purple-500 text-white',
    overview: 'Registrar of Companies (ROC) compliance ensures the legality and transparency of corporate operations. This program covers the Companies Act 2013, director duties, annual documentation (AOC-4 & MGT-7), and portal submission.',
    modules: [
      { id: 1, title: 'Overview of Companies Act 2013 Compliance', duration: '1 hour', level: 'Beginner', completed: true },
      { id: 2, title: 'Drafting Board Minutes & AGM Resolutions', duration: '1.4 hours', level: 'Intermediate', completed: false },
      { id: 3, title: 'Director KYC (DIR-3 KYC) & ACTIVE Filings', duration: '1.1 hours', level: 'Intermediate', completed: false },
      { id: 4, title: 'Filing AOC-4 (Financials) and MGT-7 (Annual Return)', duration: '2 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'Filing DIR-3 KYC on the MCA V3 Portal', duration: '15:20', rating: 4.8 },
      { id: 2, title: 'Preparing AOC-4 XBRL Financial Sheets', duration: '28:10', rating: 4.7 },
      { id: 3, title: 'Drafting Minutes of the First Board Meeting', duration: '11:45', rating: 4.9 }
    ],
    forms: [
      { code: 'AOC-4', name: 'Filing Financial Statements', mca: 'MCA Portal' },
      { code: 'MGT-7', name: 'Annual Return of Company', mca: 'MCA Portal' },
      { code: 'DIR-3 KYC', name: 'Director KYC Verification', mca: 'MCA Portal' }
    ],
    templates: [
      { name: 'Standard Board Meeting Notice & Minutes Draft', size: '940 KB', downloads: '8,400' },
      { name: 'Annual General Meeting (AGM) Notice Sample', size: '1.2 MB', downloads: '5,900' }
    ],
    faqs: [
      { q: 'What is the due date for filing Form AOC-4?', a: 'AOC-4 must be filed within 30 days of the Annual General Meeting (AGM), which is typically held by September 30th.' },
      { q: 'What is the late fee for late ROC filings?', a: 'Late filings incur an additional fee of ₹100 per day per form with no upper limit.' }
    ],
    updates: [
      { title: 'MCA V3 Ticket Resolution Timelines Shortened', date: 'May 22, 2026', type: 'Portal Alert' },
      { title: 'Relaxation of Additional Fees for Small Company Filings', date: 'May 14, 2026', type: 'Clarification' }
    ]
  },
  'company-registration': {
    title: 'Company Registration',
    description: 'Incorporate Private Limited, LLP, One Person Company, and register under Startup India.',
    iconColor: 'bg-indigo-500 text-white',
    overview: 'Proper business registration lays the foundation for investment and operational scale. Learn how to reserve names, design Memorandum of Association (MOA), file SPICe+, and secure incorporation certificates.',
    modules: [
      { id: 1, title: 'Choosing Business Structure: Pvt Ltd vs LLP', duration: '40 mins', level: 'Beginner', completed: true },
      { id: 2, title: 'Securing DSC (Digital Signature) & DIN Details', duration: '50 mins', level: 'Beginner', completed: true },
      { id: 3, title: 'Filing SPICe+ Part A & B incorporation forms', duration: '2.2 hours', level: 'Advanced', completed: false },
      { id: 4, title: 'Post-Incorporation Compliances & Bank Setup', duration: '1.2 hours', level: 'Intermediate', completed: false }
    ],
    videos: [
      { id: 1, title: 'SPICe+ Incorporation Form Walkthrough', duration: '26:40', rating: 4.9 },
      { id: 2, title: 'How to Incorporate an LLP on MCA V3', duration: '19:15', rating: 4.6 },
      { id: 3, title: 'Applying for DPIIT Startup Recognition', duration: '14:10', rating: 4.8 }
    ],
    forms: [
      { code: 'SPICe+', name: 'Simplified Proforma for Incorporating Company Electronically', mca: 'MCA Portal' },
      { code: 'RUN', name: 'Reserve Unique Name Application', mca: 'MCA Portal' },
      { code: 'Form FiLLiP', name: 'LLP Incorporation Application', mca: 'MCA Portal' }
    ],
    templates: [
      { name: 'Standard Memorandum of Association (MoA) Sample', size: '1.4 MB', downloads: '12,900' },
      { name: 'Shareholders Agreement (SHA) Template', size: '3.8 MB', downloads: '4,100' }
    ],
    faqs: [
      { q: 'What is a One Person Company (OPC)?', a: 'An OPC is a company incorporated with only one member, enjoying the benefits of separate legal entity status and limited liability.' },
      { q: 'Is a physical office required for registration?', a: 'Yes, a registered office address is mandatory. A utility bill along with an NOC (No Objection Certificate) from the owner must be uploaded.' }
    ],
    updates: [
      { title: 'Zero Incorporation Fees for Small Capital Startups', date: 'May 16, 2026', type: 'Benefit' },
      { title: 'Startup India Portal Registration Simplified', date: 'May 08, 2026', type: 'Amendment' }
    ]
  },
  'trademark': {
    title: 'Trademark Registration',
    description: 'Conduct trademark search, file TM-A applications, and draft replies to examiner objections.',
    iconColor: 'bg-cyan-500 text-white',
    overview: 'Protect intellectual property and brand equity. This course teaches class selection, executing public search under the Vienna Convention, filing TM-A, and drafting responses to standard Section 9/11 objections.',
    modules: [
      { id: 1, title: 'Basics of Intellectual Property & Trademarks', duration: '40 mins', level: 'Beginner', completed: true },
      { id: 2, title: 'Conducting TM Search & Checking Class lists', duration: '1 hour', level: 'Intermediate', completed: false },
      { id: 3, title: 'Filing Form TM-A Step-by-Step', duration: '1.5 hours', level: 'Intermediate', completed: false },
      { id: 4, title: 'Drafting Response to Section 9 & 11 Objections', duration: '2.2 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'Trademark Public Search Tutorial', duration: '10:15', rating: 4.7 },
      { id: 2, title: 'Filing TM-A Application live Demo', duration: '18:30', rating: 4.8 },
      { id: 3, title: 'Drafting TM Objection Replies', duration: '24:00', rating: 4.9 }
    ],
    forms: [
      { code: 'TM-A', name: 'Application for Registration of Trademark', mca: 'IP India Portal' },
      { code: 'TM-48', name: 'Power of Attorney Authorization', mca: 'IP India Portal' },
      { code: 'TM-M', name: 'Request for Amendment or Extension', mca: 'IP India Portal' }
    ],
    templates: [
      { name: 'Trademark Objection Reply Section 9 Format', size: '780 KB', downloads: '6,300' },
      { name: 'User Affidavit for Prior Use Evidence', size: '1.1 MB', downloads: '4,800' }
    ],
    faqs: [
      { q: 'What is a trademark class?', a: 'Trademarks are categorized into 45 classes (1 to 34 for goods and 35 to 45 for services) based on the type of product or service.' },
      { q: 'How long is a trademark registration valid?', a: 'A registered trademark is valid for 10 years from the date of application, after which it must be renewed.' }
    ],
    updates: [
      { title: 'Intellectual Property Hearings Go Fully Virtual', date: 'May 25, 2026', type: 'Circular' },
      { title: 'New Expedited Trademark Examination Fees Updated', date: 'May 11, 2026', type: 'Fees' }
    ]
  },
  'payroll-hr': {
    title: 'Payroll & HR',
    description: 'Calculate salary structures, Provident Fund (PF), ESI, PT, and local labour compliance.',
    iconColor: 'bg-pink-500 text-white',
    overview: 'Handle structural salary breakups, calculate provident funds (PF), manage ESI contributions, draft compliance letters, and comply with state wage and labor guidelines.',
    modules: [
      { id: 1, title: 'Salary Structure Design: Basic, HRA, Allowances', duration: '50 mins', level: 'Beginner', completed: true },
      { id: 2, title: 'Provident Fund (PF) ECR Generation & Filing', duration: '1.2 hours', level: 'Intermediate', completed: false },
      { id: 3, title: 'ESIC Online Portal Registry and Benefits', duration: '1 hour', level: 'Intermediate', completed: false },
      { id: 4, title: 'Gratuity, Bonus Act, and Labour law registers', duration: '1.8 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'EPFO Portal Return Filing Walkthrough', duration: '16:10', rating: 4.8 },
      { id: 2, title: 'ESIC Monthly ECR Upload live Demo', duration: '14:45', rating: 4.7 },
      { id: 3, title: 'Tax-Efficient Salary Structuring Strategies', duration: '22:15', rating: 4.9 }
    ],
    forms: [
      { code: 'Form 5', name: 'PF New Joining Registration Form', mca: 'EPFO Portal' },
      { code: 'Form 32', name: 'Muster Roll Wage Register', mca: 'Labor Dept' },
      { code: 'Form 12A', name: 'Monthly PF Contribution Report', mca: 'EPFO Portal' }
    ],
    templates: [
      { name: 'Comprehensive Payroll Excel Calculator', size: '3.6 MB', downloads: '18,500' },
      { name: 'Standard Employee Offer Letter & Salary Slip Word Draft', size: '820 KB', downloads: '14,200' }
    ],
    faqs: [
      { q: 'What is the employee and employer PF contribution rate?', a: 'Generally, both the employee and the employer contribute 12% of the employee\'s basic salary + dearness allowance.' },
      { q: 'When is ESI registration mandatory?', a: 'ESI registration is mandatory for businesses employing 10 or more employees (in some states 20) with salaries under ₹21,000 per month.' }
    ],
    updates: [
      { title: 'Unified Labour Portal Launch Scheduled for June', date: 'May 19, 2026', type: 'IT Alert' },
      { title: 'Gratuity Contribution Rules Clarified by Ministry', date: 'May 06, 2026', type: 'Clarification' }
    ]
  },
  'accounting': {
    title: 'Accounting',
    description: 'Learn double entry bookkeeping, ledgers, Bank Reconciliation, and balance sheets.',
    iconColor: 'bg-amber-500 text-white',
    overview: 'Double-entry bookkeeping underpins all business finance. This course takes you from fundamental golden rules to ledger posting, cash flows, and trial balance preparation.',
    modules: [
      { id: 1, title: 'Accounting Golden Rules & Journal Entries', duration: '1 hour', level: 'Beginner', completed: true },
      { id: 2, title: 'Posting to Ledgers & Trial Balance Audit', duration: '1.2 hours', level: 'Intermediate', completed: false },
      { id: 3, title: 'Bank Reconciliation Statements (BRS) Formulas', duration: '1.5 hours', level: 'Intermediate', completed: false },
      { id: 4, title: 'Finalizing P&L Account and Balance Sheets', duration: '2.5 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'Double Entry Bookkeeping Core Concepts', duration: '18:20', rating: 4.9 },
      { id: 2, title: 'How to Reconcile Bank Statements in Excel', duration: '15:40', rating: 4.8 },
      { id: 3, title: 'Reading and Analyzing a Balance Sheet', duration: '23:10', rating: 4.7 }
    ],
    forms: [
      { code: 'Form 3CD', name: 'Statement of Particulars (Tax Audit)', mca: 'IT Portal' },
      { code: 'Schedule III', name: 'Balance Sheet Format Companies Act', mca: 'MCA Guidelines' }
    ],
    templates: [
      { name: 'T-Ledger Book keeping Template', size: '1.5 MB', downloads: '15,800' },
      { name: 'Bank Reconciliation Automated Excel Sheet', size: '2.8 MB', downloads: '9,400' }
    ],
    faqs: [
      { q: 'What is the basic accounting equation?', a: 'Assets = Liabilities + Owner\'s Equity. This equation must always balance.' },
      { q: 'What is the difference between cash and accrual accounting?', a: 'Cash accounting records revenue when cash is received; accrual accounting records revenue when it is earned, regardless of when cash changes hands.' }
    ],
    updates: [
      { title: 'AS-10 Property, Plant and Equipment Compliance Update', date: 'May 23, 2026', type: 'Standards' },
      { title: 'MCA issues revised schedule of depreciation', date: 'May 09, 2026', type: 'Circular' }
    ]
  },
  'audit': {
    title: 'Audit & Assurance',
    description: 'Master internal audit, statutory CARO checklist, working papers, and documentation.',
    iconColor: 'bg-rose-500 text-white',
    overview: 'Auditing guarantees corporate reliability. Learn how to plan audits, execute internal controls, collect corroborative evidence, design audit working papers, and draft audit reports complying with CARO 2020.',
    modules: [
      { id: 1, title: 'Introduction to Auditing Standards & Code', duration: '50 mins', level: 'Beginner', completed: true },
      { id: 2, title: 'Planning Audit, Assessing Risks & Controls', duration: '1.2 hours', level: 'Intermediate', completed: false },
      { id: 3, title: 'Substantive Testing & Auditing Working Papers', duration: '1.8 hours', level: 'Advanced', completed: false },
      { id: 4, title: 'Drafting Audit Reports & CARO compliance', duration: '2.2 hours', level: 'Advanced', completed: false }
    ],
    videos: [
      { id: 1, title: 'Statutory CARO 2020 Guidelines', duration: '28:15', rating: 4.9 },
      { id: 2, title: 'Designing Audit Working Paper Folders', duration: '16:50', rating: 4.8 },
      { id: 3, title: 'Internal Controls Evaluation Walkthrough', duration: '19:40', rating: 4.6 }
    ],
    forms: [
      { code: 'Form ADT-1', name: 'Notice of Appointment of Auditor', mca: 'MCA Portal' },
      { code: 'CARO 2020', name: 'Companies Auditor Report Order Checklist', mca: 'ICAI Issued' }
    ],
    templates: [
      { name: 'Statutory Audit Planning Checklist', size: '2.1 MB', downloads: '11,200' },
      { name: 'Audit Engagement Letter Sample Word Draft', size: '750 KB', downloads: '8,400' }
    ],
    faqs: [
      { q: 'What is CARO 2020?', a: 'Companies (Auditor\'s Report) Order, 2020 is a directive issued by the MCA specifying matters which auditors must report in statutory audit reports.' },
      { q: 'What is the purpose of an Audit Working Paper?', a: 'Working papers are the documents prepared or obtained by the auditor to support the findings and audit opinion rendered.' }
    ],
    updates: [
      { title: 'ICAI Issues Revised Standard on Quality Control (SQC 1)', date: 'May 24, 2026', type: 'Notification' },
      { title: 'New Reporting Requirements for Crypto Asset Transactions', date: 'May 04, 2026', type: 'Mandate' }
    ]
  }
};

const LearningPage = () => {
  const { service } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Overview');
  const serviceKey = service ? service.toLowerCase() : 'gst';
  const data = SERVICES_DATA[serviceKey] || SERVICES_DATA['gst'];

  // Tab configurations
  const tabs = [
    { name: 'Overview', icon: <Globe size={18} /> },
    { name: 'Learn', icon: <BookOpen size={18} /> },
    { name: 'Videos', icon: <PlayCircle size={18} /> },
    { name: 'Forms', icon: <FileCode size={18} /> },
    { name: 'Templates', icon: <FileText size={18} /> },
    { name: 'FAQs', icon: <HelpCircle size={18} /> },
    { name: 'Updates', icon: <Bell size={18} /> }
  ];

  const handleDownload = (name) => {
    toast.success(`Downloading template: ${name}`);
  };

  const handleStartLesson = (title) => {
    toast.success(`Starting lesson: ${title}`);
  };

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVideo, setEditVideo] = useState(null);
  const [credits, setCredits] = useState(null);
  const { user } = useAuth();
  const canManage = useCanManageVideos();

  useEffect(() => {
    const load = async () => {
      try {
        const currentCategory = CATEGORY_MAP[serviceKey] || 'GST';
        const res = await fetchVideos(currentCategory);
        setVideos(res.data.videos || []);
        
        if (user?.role === 'student') {
          const creditRes = await api.get('/student/credits');
          setCredits(creditRes.data.credits?.remaining_credits || 0);
        } else {
          setCredits(9999); // Admins/managers bypass credit check visually here
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingVideos(false);
      }
    };
    load();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteVideo(id);
      toast.success('Video deleted');
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 font-sans bg-[#F8FAFC]">
      {/* Back to Dashboard Link */}
      <div className="flex items-center justify-between">
        <Link 
          to="/student/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <span className="text-xs font-bold text-slate-400">Compliance & Business School</span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 rounded-full border border-cyan-100">
            <BookOpen size={14} className="text-cyan-600 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-600">Active Academy Module</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {data.title} Learning Suite
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-3xl leading-relaxed">
            {data.description} Dive into high-definition interactive compliance tutorials, templates, and walkthroughs.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 pt-2">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {data.modules.length} modules</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5"><PlayCircle size={14} /> {data.videos.length} video lectures</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5"><FileText size={14} /> {data.templates.length} templates</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap -mb-px gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 py-4 px-3 border-b-2 text-sm font-semibold tracking-wide transition-all duration-200 relative
                  ${isActive 
                    ? 'border-cyan-600 text-cyan-600 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600" 
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm"
          >
            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Module Overview</h3>
                <p className="text-slate-500 leading-relaxed text-base">{data.overview}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      What you will learn
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600 font-medium">
                      <li>&bull; Comprehensive step-by-step portal filing walkthroughs</li>
                      <li>&bull; Advanced handling of notices, objections, and warnings</li>
                      <li>&bull; Accurate structural designs and computation sheets</li>
                      <li>&bull; Post-registration requirements and audit readiness checklists</li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Star className="text-cyan-500" size={18} />
                      Course Features
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600 font-medium">
                      <li>&bull; Practical case studies based on active industry files</li>
                      <li>&bull; Fully customizable Excel models and doc templates</li>
                      <li>&bull; Certificate of competency issued on curriculum completion</li>
                      <li>&bull; Direct access to expert community support forums</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LEARN */}
            {activeTab === 'Learn' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Interactive Curriculum</h3>
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                    {data.modules.filter(m => m.completed).length} / {data.modules.length} Completed
                  </span>
                </div>

                <div className="space-y-4">
                  {data.modules.map((mod) => (
                    <div 
                      key={mod.id} 
                      className={`flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-2xl border transition-all duration-200
                        ${mod.completed 
                          ? 'bg-slate-50/50 border-slate-100' 
                          : 'bg-white border-slate-200 hover:border-cyan-500/40 shadow-sm'
                        }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${mod.completed 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {mod.completed ? '✓' : mod.id}
                          </span>
                          <span className={`font-bold text-sm sm:text-base ${mod.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {mod.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pl-8">
                          <span>{mod.duration}</span>
                          <span>&bull;</span>
                          <span className={`font-bold ${mod.level === 'Advanced' ? 'text-rose-500' : mod.level === 'Intermediate' ? 'text-purple-500' : 'text-blue-500'}`}>
                            {mod.level}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartLesson(mod.title)}
                        className={`mt-3 sm:mt-0 px-4 py-2 text-xs font-bold rounded-xl transition-all self-start sm:self-auto
                          ${mod.completed 
                            ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' 
                            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-sm shadow-cyan-600/10'
                          }`}
                      >
                        {mod.completed ? 'Review Lesson' : 'Start Learning'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: VIDEOS */}
            {activeTab === 'Videos' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                  Expert Video Lectures
                  {canManage && (
                    <button onClick={() => { setEditVideo(null); setShowModal(true); }} className="bg-cyan-600 text-white px-3 py-1 rounded hover:bg-cyan-700 transition">
                      + Add Video
                    </button>
                  )}
                </h3>
                
                {user?.role === 'student' && credits === 0 ? (
                  <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center">
                    <h4 className="text-lg font-bold text-rose-600 mb-2">Access Restricted</h4>
                    <p className="text-rose-500">
                      You have exhausted your learning credits.<br />
                      Please contact your administrator to request additional credits.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loadingVideos ? (
                      <p>Loading videos...</p>
                    ) : videos.length === 0 ? (
                      <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500">
                        No learning videos are available for this category yet.<br />
                        Please check back later.
                      </div>
                    ) : (
                      videos.map((vid) => (
                        <div key={vid.id} className="relative group">
                          <VideoCard video={vid} />
                          {canManage && (
                            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditVideo(vid); setShowModal(true); }} className="text-cyan-600 hover:text-cyan-800 bg-white/90 px-2 py-1 rounded text-xs">Edit</button>
                              <button onClick={() => handleDelete(vid.id)} className="text-red-600 hover:text-red-800 bg-white/90 px-2 py-1 rounded text-xs">Delete</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FORMS */}
            {activeTab === 'Forms' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Official Portal Forms</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold">
                        <th className="py-3 px-4">Form Code</th>
                        <th className="py-3 px-4">Form Name / Description</th>
                        <th className="py-3 px-4">Portal Authority</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.forms.map((form) => (
                        <tr key={form.code} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                          <td className="py-3.5 px-4 text-cyan-600 font-bold font-mono">{form.code}</td>
                          <td className="py-3.5 px-4 text-slate-900">{form.name}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-semibold">{form.mca}</td>
                          <td className="py-3.5 px-4 text-right">
                            <a 
                              href={serviceKey === 'gst' && form.code === 'REG-01' ? '/gst' : '#'} 
                              target={serviceKey === 'gst' && form.code === 'REG-01' ? '_blank' : '_self'}
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-600 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                            >
                              Open Portal
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TEMPLATES */}
            {activeTab === 'Templates' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Customizable Compliance Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.templates.map((temp, i) => (
                    <div 
                      key={i} 
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-between hover:border-cyan-500/20 transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm md:text-base leading-tight">{temp.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">Size: {temp.size} &bull; {temp.downloads} Downloads</p>
                      </div>
                      <button
                        onClick={() => handleDownload(temp.name)}
                        className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: FAQS */}
            {activeTab === 'FAQs' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {data.faqs.map((faq, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                        <HelpCircle className="text-cyan-500 shrink-0" size={18} />
                        {faq.q}
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm pl-7 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: UPDATES */}
            {activeTab === 'Updates' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Latest Compliance Updates</h3>
                <div className="space-y-4">
                  {data.updates.map((upd, i) => (
                    <div 
                      key={i} 
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{upd.title}</h4>
                        <p className="text-xs text-slate-400 font-semibold">Published: {upd.date}</p>
                      </div>
                      <span className="self-start sm:self-auto text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-rose-50 text-rose-500 border border-rose-100">
                        {upd.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {showModal && (
          <AddEditVideoModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            isEdit={!!editVideo}
            initialUrl={editVideo ? (editVideo.youtube_url || editVideo.url) : ''}
            initialCategory={editVideo ? editVideo.category : (CATEGORY_MAP[serviceKey] || 'GST')}
            onSubmit={async (url, cat) => {
              try {
                const currentCategory = CATEGORY_MAP[serviceKey] || 'GST';
                if (editVideo) {
                  const res = await updateVideo(editVideo.id, url, cat);
                  if (cat !== currentCategory) {
                    setVideos(prev => prev.filter(v => v.id !== editVideo.id));
                  } else {
                    setVideos(prev => prev.map(v => v.id === editVideo.id ? res.data.video : v));
                  }
                  toast.success('Video updated');
                } else {
                  const res = await addVideo(url, cat);
                  const newVideo = res.data.video;
                  if (cat === currentCategory) {
                    setVideos(prev => [newVideo, ...prev]);
                  }
                  toast.success('Video added');
                }
                setShowModal(false);
              } catch (e) {
                toast.error(e.response?.data?.message || 'Failed to save video');
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LearningPage;
