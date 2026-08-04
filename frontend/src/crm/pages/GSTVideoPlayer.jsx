import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import YouTube from 'react-youtube';

const GSTVideoPlayer = () => {
  const { service, videoId } = useParams();
  const navigate = useNavigate();
  
  const formatServiceName = (srv) => {
    const map = {
      'gst': 'GST',
      'income-tax': 'Income Tax',
      'roc-compliance': 'ROC Compliance',
      'company-registration': 'Company Registration',
      'trademark': 'Trademark',
      'payroll-hr': 'Payroll & HR',
      'accounting': 'Accounting',
      'audit': 'Audit & Assurance'
    };
    return map[srv] || 'GST';
  };
  
  const [sessionId, setSessionId] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('Your credits have run out. Please request additional credits from your manager to continue learning.');
  const [remainingCredits, setRemainingCredits] = useState(0);
  const [creditsBurned, setCreditsBurned] = useState(0);
  const [totalWatchSeconds, setTotalWatchSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for tracking time without causing re-renders
  const playerRef = useRef(null);
  const playTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const accumulatedSecondsRef = useRef(0);

  if (!videoId) {
    return <div className="p-8 text-slate-500">Video not found.</div>;
  }

  useEffect(() => {
    // Start session and get initial credits
    const initSession = async () => {
      try {
        const res = await api.post('/video/start', { video_id: videoId });
        setSessionId(res.data.session.id);
        setCreditsBurned(res.data.session.credits_burned);
        setTotalWatchSeconds(res.data.session.watch_seconds);
        
        // Fetch current credits to show in UI
        const creditsRes = await api.get('/student/credits');
        if (creditsRes.data.credits) {
          setRemainingCredits(creditsRes.data.credits.remaining_credits);
          setCreditsBurned(creditsRes.data.credits.used_credits);
          if (creditsRes.data.credits.remaining_credits <= 0) {
            setBlocked(true);
          }
        }
      } catch (e) {
        console.error('Failed to start session', e);
        if (e.response?.status === 403) {
          setBlocked(true);
          setBlockedMessage(e.response.data.message || 'You have exhausted your learning credits. Please contact your administrator to request additional credits.');
          toast.error(e.response.data.message || 'Insufficient credits to start video.');
        } else {
          toast.error('Failed to load video session.');
        }
      }
    };
    initSession();

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sessionId) {
        // End session when leaving
        api.post('/video/end', { session_id: sessionId, percentage_watched: 0 }).catch(console.error);
      }
    };
  }, [videoId]);

  // Handle actual time tracking every second if playing
  useEffect(() => {
    if (isPlaying && !blocked) {
      playTimerRef.current = setInterval(() => {
        if (!document.hidden) {
          accumulatedSecondsRef.current += 1;
          setTotalWatchSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, blocked]);

  // Page Visibility handler to pause video when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playerRef.current) {
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reusable sync function
  const syncProgress = async () => {
    if (!sessionId || blocked) return;
    const secondsToSync = accumulatedSecondsRef.current;
    if (secondsToSync > 0) {
      accumulatedSecondsRef.current = 0; // Reset local counter immediately
      
      try {
        const res = await api.post('/video/progress', { 
          session_id: sessionId, 
          watched_seconds_increment: secondsToSync 
        });
        
        setRemainingCredits(res.data.remaining_credits);
        setCreditsBurned(res.data.used_credits);
        
        if (res.data.remaining_credits <= 0) {
          setBlocked(true);
          setIsPlaying(false);
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo();
          }
          toast.error('Session paused: Learning credits exhausted.');
        }
      } catch (e) {
        console.error('Sync failed', e);
        if (e.response?.status === 403) {
          setBlocked(true);
          setBlockedMessage(e.response.data.message || 'Session paused: Insufficient credits');
          setIsPlaying(false);
          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo();
          }
          toast.error(e.response.data.message || 'Session paused: Insufficient credits');
        } else {
          // Add back the seconds if network failed so we try again next time
          accumulatedSecondsRef.current += secondsToSync;
        }
      }
    }
  };

  // Sync to backend every 15 seconds for responsive UI updates
  useEffect(() => {
    intervalRef.current = setInterval(syncProgress, 15000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, blocked]);

  // Sync when leaving the page or pausing
  useEffect(() => {
    return () => {
      if (accumulatedSecondsRef.current > 0) {
        syncProgress();
      }
    };
  }, [sessionId, blocked]);

  const onPlayerStateChange = (event) => {
    // 1 (PLAYING), 2 (PAUSED), 3 (BUFFERING), 0 (ENDED)
    if (event.data === YouTube.PlayerState.PLAYING) {
      if (blocked) {
        event.target.pauseVideo();
        toast.error('Cannot play: Insufficient credits.');
      } else {
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
    }
    
    if (event.data === YouTube.PlayerState.ENDED) {
       api.post('/video/end', { session_id: sessionId, percentage_watched: 100 }).catch(console.error);
    }
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/learning/${service || 'gst'}`, { state: { activeTab: 'Videos' } })}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Video Lesson</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Learning Center</span>
                <span>•</span>
                <span>{formatServiceName(service)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-sm font-medium text-slate-700">
                {isPlaying ? 'Watching...' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
               <Zap size={24} />
             </div>
             <div>
               <p className="text-sm text-slate-500">Remaining Credits</p>
               <p className="text-xl font-bold text-slate-900">{remainingCredits}</p>
             </div>
           </div>
           
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
               <Zap size={24} />
             </div>
             <div>
               <p className="text-sm text-slate-500">Used Credits</p>
               <p className="text-xl font-bold text-slate-900">{creditsBurned}</p>
             </div>
           </div>
           
           <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
               <Clock size={24} />
             </div>
             <div>
               <p className="text-sm text-slate-500">Watch Time</p>
               <p className="text-xl font-bold text-slate-900">{formatTime(totalWatchSeconds)}</p>
             </div>
           </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative"
        >
          <div className="p-2 sm:p-4 bg-slate-900 rounded-[2rem]">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner relative">
              {blocked ? (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 text-white p-8 text-center backdrop-blur-sm">
                  <Zap size={48} className="text-rose-500 mb-4" />
                  <h3 className="text-3xl font-bold text-rose-500 mb-2">Service Unavailable</h3>
                  <p className="text-slate-300 max-w-md">{blockedMessage}</p>
                  <button onClick={() => navigate('/student/dashboard')} className="mt-8 px-8 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-full font-bold transition-colors">
                    Return to Dashboard
                  </button>
                </div>
              ) : null}
              
              <YouTube
                videoId={videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
                onStateChange={onPlayerStateChange}
                onReady={onPlayerReady}
                className={`w-full h-full absolute inset-0 ${blocked ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                iframeClassName="w-full h-full border-0"
              />
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Module Lecture</h2>
            <p className="text-slate-600 mt-2 leading-relaxed max-w-3xl">
              Watch this comprehensive video lesson to understand the fundamental concepts. Make sure to complete the entire module before proceeding to the next section.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GSTVideoPlayer;
