import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Props:
 * - isOpen: boolean to control visibility
 * - onClose: function to close modal
 * - onSubmit: async function receiving YouTube URL string
 * - initialUrl: optional string for edit mode
 * - initialCategory: optional string for edit mode
 * - isEdit: boolean flag for edit mode
 */
const CATEGORIES = [
  'GST',
  'Income Tax',
  'ROC Compliance',
  'Company Registration',
  'Trademark',
  'Payroll & HR',
  'Accounting',
  'Audit & Assurance'
];

const AddEditVideoModal = ({ isOpen, onClose, onSubmit, initialUrl = '', initialCategory = '', isEdit = false }) => {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setUrl(initialUrl);
    setCategory(initialCategory);
    setError('');
  }, [initialUrl, initialCategory, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please paste a YouTube video URL.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    try {
      await onSubmit(url.trim(), category);
    } catch (err) {
      setError('Operation failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          {isEdit ? 'Edit YouTube Video' : 'Add YouTube Video'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Paste YouTube video link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-black placeholder-slate-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-black"
          >
            <option value="">Select Category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end space-x-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition">
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditVideoModal;
