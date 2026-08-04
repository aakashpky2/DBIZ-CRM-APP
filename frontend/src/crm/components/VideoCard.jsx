import React from 'react';
import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getServiceKey = (category) => {
  const map = {
    'GST': 'gst',
    'Income Tax': 'income-tax',
    'ROC Compliance': 'roc-compliance',
    'Company Registration': 'company-registration',
    'Trademark': 'trademark',
    'Payroll & HR': 'payroll-hr',
    'Accounting': 'accounting',
    'Audit & Assurance': 'audit'
  };
  return map[category] || 'gst';
};

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const videoId = video.video_id || getYouTubeId(video.youtube_url || video.url);
  const thumbnailUrl = video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');

  const handleClick = () => {
    if (videoId) {
      navigate(`/learning/${getServiceKey(video.category)}/video/${videoId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col justify-between group"
      role="button"
      tabIndex={0}
      aria-label={`Watch ${video.title} on YouTube`}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="aspect-video bg-slate-900 flex items-center justify-center text-white relative overflow-hidden">
        {thumbnailUrl && (
          <img 
            src={thumbnailUrl} 
            alt={`${video.title} thumbnail`}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
          />
        )}
        <PlayCircle 
          className="text-white relative z-10 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" 
          size={50} 
        />
      </div>
      <div className="p-4 space-y-2 flex-grow flex items-center">
        <h4 className="font-bold text-slate-900 text-sm leading-snug">{video.title}</h4>
      </div>
    </div>
  );
};

export default VideoCard;
