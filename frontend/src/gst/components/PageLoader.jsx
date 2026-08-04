import React, { useEffect } from 'react';

const PageLoader = ({ loading }) => {
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  if (!loading) return null;
  return (
    <div className="page-loader-overlay">
      <div className="gst-loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default PageLoader;
