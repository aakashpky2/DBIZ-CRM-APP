import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchVideos, addVideo, updateVideo, deleteVideo } from '../services/VideoService';
import VideoCard from './VideoCard';
import AddEditVideoModal from './AddEditVideoModal';

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editVideo, setEditVideo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchVideos();
        setVideos(res.data.videos || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingVideos(false);
      }
    };
    load();
  }, []);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Learning Videos</h2>
          <p className="text-slate-500 text-sm">Upload and manage videos that will appear on the student dashboard.</p>
        </div>
        <button 
          onClick={() => { setEditVideo(null); setShowModal(true); }} 
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
        >
          + Add New Video
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingVideos ? (
          <p className="text-slate-500">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-slate-500 col-span-full">No videos uploaded yet.</p>
        ) : (
          videos.map((vid) => (
            <div key={vid.id} className="relative group">
              <VideoCard video={vid} />
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={() => { setEditVideo(vid); setShowModal(true); }} 
                  className="bg-white/90 text-cyan-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-50 shadow-sm backdrop-blur-sm transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(vid.id)} 
                  className="bg-white/90 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-50 shadow-sm backdrop-blur-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <AddEditVideoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          isEdit={!!editVideo}
          initialUrl={editVideo ? (editVideo.youtube_url || editVideo.url) : ''}
          initialCategory={editVideo ? editVideo.category : ''}
          onSubmit={async (url, cat) => {
            try {
              if (editVideo) {
                const res = await updateVideo(editVideo.id, url, cat);
                setVideos(prev => prev.map(v => v.id === editVideo.id ? res.data.video : v));
                toast.success('Video updated');
              } else {
                const res = await addVideo(url, cat);
                const newVideo = res.data.video;
                setVideos(prev => [newVideo, ...prev]);
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
  );
};

export default ManageVideos;
