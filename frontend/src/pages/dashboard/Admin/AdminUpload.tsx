import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, XIcon, UploadCloudIcon, ImageIcon, VideoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export async function fetchGallery() {
  const res = await fetch('http://localhost:8080/api/gallery');
  return res.json();
}

export async function uploadGalleryItem(formData: FormData) {
  const res = await fetch('http://localhost:8080/api/gallery', {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

const AdminUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('haircut');
  const [stylist, setStylist] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setMessage('Please select a file.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('stylist', stylist);

    try {
      await uploadGalleryItem(formData);
      setMessage('Upload successful!');
      setTitle('');
      setDescription('');
      setStylist('');
      setFile(null);
      setShowPreview(false);
    } catch {
      setMessage('Upload failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white">
      {/* Header */}
      <div className="bg-[#181818] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/admin')}
              className="p-2 hover:bg-[#232323] rounded-lg transition-colors"
            >
              <ArrowLeftIcon size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white font-abril">Gallery Upload</h1>
              <p className="text-gray-400 mt-1">Add new photos and videos to your salon gallery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-[#181818] rounded-xl border border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">File</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => {
                    setFile(e.target.files?.[0] || null);
                    setShowPreview(true);
                  }}
                  className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                />
                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setShowPreview(false);
                    }}
                    className="p-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] transition-colors"
                  >
                    <XIcon size={18} />
                  </button>
                )}
              </div>
              {showPreview && file && (
                <div className="mt-4">
                  {file.type.startsWith('image') ? (
                    <div className="flex items-center gap-2">
                      <ImageIcon size={20} className="text-[#F7BF24]" />
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border border-gray-600"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <VideoIcon size={20} className="text-[#F7BF24]" />
                      <video
                        src={URL.createObjectURL(file)}
                        controls
                        className="w-32 h-32 object-cover rounded border border-gray-600"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stylist</label>
              <input
                type="text"
                placeholder="Stylist"
                value={stylist}
                onChange={e => setStylist(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                required
              >
                <option value="haircut">Haircut</option>
                <option value="beard">Beard</option>
                <option value="tattoo">Tattoo</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setTitle('');
                  setDescription('');
                  setStylist('');
                  setCategory('haircut');
                  setMessage('');
                  setShowPreview(false);
                }}
                className="flex-1 px-4 py-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#F7BF24] hover:bg-yellow-400 text-black rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <UploadCloudIcon size={18} />
                Upload
              </button>
            </div>
          </form>
          {message && (
            <div className="mt-6 text-center text-lg font-semibold text-[#F7BF24]">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;