import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Award,
  Zap,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const gstModules = [
  {
    id: 1,
    title: 'GST Basics',
    description: 'Fundamentals of Goods and Services Tax in India.',
    lessons: 12,
    completion: 100,
    icon: <BookOpen className="text-blue-500" size={24} />,
    color: 'blue'
  },
  {
    id: 2,
    title: 'GST Registration',
    description: 'Step-by-step process to register for GST.',
    lessons: 8,
    completion: 65,
    icon: <ShieldCheck className="text-cyan-500" size={24} />,
    color: 'cyan'
  },
  {
    id: 3,
    title: 'GST Return Filing',
    description: 'How to file GSTR-1, GSTR-3B, and GSTR-9.',
    lessons: 15,
    completion: 30,
    icon: <FileText className="text-emerald-500" size={24} />,
    color: 'emerald'
  },
  {
    id: 4,
    title: 'Input Tax Credit',
    description: 'Understanding ITC eligibility and reversals.',
    lessons: 10,
    completion: 0,
    icon: <Zap className="text-amber-500" size={24} />,
    color: 'amber'
  },
  {
    id: 5,
    title: 'GST Notices',
    description: 'Handling ASMT-10 and other tax notices.',
    lessons: 6,
    completion: 0,
    icon: <AlertCircle className="text-red-500" size={24} />,
    color: 'red'
  },
  {
    id: 6,
    title: 'GST Case Studies',
    description: 'Practical analysis of landmark GST cases.',
    lessons: 5,
    completion: 0,
    icon: <Briefcase className="text-purple-500" size={24} />,
    color: 'purple'
  }
];

export const weeklyActivity = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 1.8 },
  { name: 'Wed', hours: 3.2 },
  { name: 'Thu', hours: 2.1 },
  { name: 'Fri', hours: 4.5 },
  { name: 'Sat', hours: 1.2 },
  { name: 'Sun', hours: 0.8 },
];

export const complianceUpdates = [
  { id: 1, title: 'GSTR-1 Due Date (Monthly)', date: 'May 11, 2026', status: 'Passed' },
  { id: 2, title: 'GSTR-3B Due Date', date: 'May 20, 2026', status: 'Upcoming' },
  { id: 3, title: 'GSTR-1 Due Date (QRMP)', date: 'July 13, 2026', status: 'Scheduled' },
];
