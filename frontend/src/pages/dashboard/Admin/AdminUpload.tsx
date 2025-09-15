import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, XIcon, UploadCloudIcon, ImageIcon, VideoIcon, Trash2Icon, EditIcon, SaveIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export async function fetchGallery() {
  try {
    const res = await fetch('http://localhost:8080/api/gallery');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
}

export async function uploadGalleryItem(formData: FormData) {
  try {
    const res = await fetch('http://localhost:8080/api/gallery', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error uploading gallery item:', error);
    throw error;
  }
}

export async function deleteGalleryItem(id: number) {
  try {
    const res = await fetch(`http://localhost:8080/api/gallery/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return true;
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return false;
  }
}

export async function updateGalleryItem(id: number, data: any) {
  try {
    const res = await fetch(`http://localhost:8080/api/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Error updating gallery item:', error);
    throw error;
  }
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

  // Gallery items state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('haircut');
  const [editStylist, setEditStylist] = useState('');

  useEffect(() => {
    fetchGallery().then(setGalleryItems);
  }, [message]);

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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      console.log('Deleting item with ID:', id);
      try {
        const success = await deleteGalleryItem(id);
        if (success) {
          setMessage('Deleted successfully!');
          setGalleryItems((items) => items.filter((item) => item.id !== id));
        } else {
          setMessage('Delete failed.');
        }
      } catch (error) {
        setMessage('Delete failed.');
        console.error('Delete error:', error);
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditStylist(item.stylist);
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const updated = await updateGalleryItem(id, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
        stylist: editStylist,
      });
      console.log('Updated item:', updated);
      setMessage('Updated successfully!');
      setGalleryItems((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
      setEditId(null);
    } catch (error) {
      setMessage('Update failed.');
      console.error('Save edit error:', error);
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

      {/* Gallery List */}
      <div className="max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-4 text-[#F7BF24]">Uploaded Gallery Items</h2>
        <div className="space-y-6">
          {galleryItems.map(item => (
            <div key={item.id} className="bg-[#181818] border border-gray-700 rounded-lg p-4 flex items-center gap-4">
              <div>
                {item.fileType === 'image' ? (
                  <img
                    src={`http://localhost:8080${item.fileUrl}`}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded border border-gray-600"
                  />
                ) : (
                  <video
                    src={`http://localhost:8080${item.fileUrl}`}
                    controls
                    className="w-20 h-20 object-cover rounded border border-gray-600"
                  />
                )}
              </div>
              <div className="flex-1">
                {editId === item.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                    />
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                      rows={2}
                    />
                    <input
                      type="text"
                      value={editStylist}
                      onChange={e => setEditStylist(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                    />
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-lg bg-[#232323] text-white"
                    >
                      <option value="haircut">Haircut</option>
                      <option value="beard">Beard</option>
                      <option value="tattoo">Tattoo</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="font-bold text-lg">{item.title}</div>
                    <div className="text-gray-300 text-sm">{item.description}</div>
                    <div className="text-xs text-[#F7BF24] mt-1">{item.stylist} • {item.category}</div>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {editId === item.id ? (
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="p-2 bg-[#F7BF24] text-black rounded-lg flex items-center justify-center hover:bg-yellow-400"
                  >
                    <SaveIcon size={16} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-[#232323] border border-gray-600 rounded-lg text-gray-300 hover:bg-[#2a2a2a] flex items-center justify-center"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-[#232323] border border-gray-600 rounded-lg text-red-400 hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2Icon size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;