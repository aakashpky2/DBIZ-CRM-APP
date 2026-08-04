import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useLearningSession = (moduleName, onCreditBurned) => {
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [activeDuration, setActiveDuration] = useState(0);
  const [creditsBurned, setCreditsBurned] = useState(0);
  
  const lastActivityRef = useRef(Date.now());
  const pulseIntervalRef = useRef(null);
  
  const INACTIVITY_THRESHOLD = 120000; // 2 minutes
  const PULSE_INTERVAL = 30000; // Send pulse every 30 seconds

  // Start Session
  useEffect(() => {
    let mounted = true;
    const startSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await axios.post(`${API_URL}/session/start`, 
          { moduleName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (mounted && res.data.success) {
          setSessionId(res.data.session.id);
          toast.success(`Learning Session Started for ${moduleName}`);
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      }
    };
    
    startSession();
    return () => { mounted = false; };
  }, [moduleName]);

  // Activity tracking
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isActive) setIsActive(true);
  }, [isActive]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, updateActivity));
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
      } else {
        updateActivity();
      }
    };
    
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', () => setIsActive(false));
    window.addEventListener('focus', updateActivity);
    
    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity));
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', () => setIsActive(false));
      window.removeEventListener('focus', updateActivity);
    };
  }, [updateActivity]);

  // Inactivity checker loop
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_THRESHOLD) {
        setIsActive(false);
      }
    }, 10000); // Check every 10s
    return () => clearInterval(checkInactivity);
  }, [INACTIVITY_THRESHOLD]);

  // Pulse to server
  useEffect(() => {
    if (!sessionId || !isActive) return;

    const pulse = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.post(`${API_URL}/session/pulse`, 
          { sessionId, activeDurationSeconds: activeDuration },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setActiveDuration(res.data.activeDurationSeconds);
          
          if (res.data.creditsBurned > creditsBurned) {
            setCreditsBurned(res.data.creditsBurned);
            if (onCreditBurned) onCreditBurned(res.data.creditsBurned);
            toast.error(`1 Credit deducted for active learning time.`);
          }

          // Pre-deduction warnings logic
          // Next burn is at 10 mins (600s), 30 mins (1800s), 60 mins (3600s)
          const d = res.data.activeDurationSeconds;
          const nextMilestones = [600, 1800, 3600]; 
          // add more logic here for generic interval...
          for (let ms of nextMilestones) {
            if (d >= ms - 300 && d < ms - 270) {
               // 5 minutes warning (only show once around the 5 min mark)
               toast('5 minutes until next credit deduction!', { icon: '⏱️' });
            }
          }
        }
      } catch (err) {
        if (err.response?.status === 402) {
           toast.error(err.response.data.message);
           setIsActive(false); // Stop if insufficient credits
        }
      }
    };

    pulseIntervalRef.current = setInterval(pulse, PULSE_INTERVAL);
    return () => clearInterval(pulseIntervalRef.current);
  }, [sessionId, isActive, activeDuration, creditsBurned, onCreditBurned, PULSE_INTERVAL]);

  return { isActive, activeDuration, creditsBurned, sessionId };
};
