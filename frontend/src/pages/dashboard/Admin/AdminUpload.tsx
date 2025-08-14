import React, { useState } from 'react';


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
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('haircut');
  const [stylist, setStylist] = useState('');
  const [message, setMessage] = useState('');

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
    } catch {
      setMessage('Upload failed.');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Gallery Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border" />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border" />
        <input type="text" placeholder="Stylist" value={stylist} onChange={e => setStylist(e.target.value)} className="w-full p-2 border" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border">
          <option value="haircut">Haircut</option>
          <option value="beard">Beard</option>
          <option value="tattoo">Tattoo</option>
        </select>
        <button type="submit" className="bg-yellow-500 px-4 py-2 rounded text-black font-bold">Upload</button>
      </form>
      {message && <div className="mt-4">{message}</div>}
    </div>
  );
};

export default AdminUpload;