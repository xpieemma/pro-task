import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const GalleryPage = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('unsplash_key') || '');
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  const [dismissedKeyPrompt, setDismissedKeyPrompt] = useState(false);

  const saveKey = () => {
    localStorage.setItem('unsplash_key', apiKey);
    setShowKeyInput(false);
    setDismissedKeyPrompt(true);
    toast.success('Key saved');
  };

  const search = async () => {
    if (!apiKey && !dismissedKeyPrompt) { setShowKeyInput(true); return; }
    setLoading(true);
    try {
      const url = query
        ? `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${apiKey}`
        : `https://api.unsplash.com/photos?per_page=12&client_id=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      setPhotos(query ? data.results : data);
    } catch {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <PublicLayout title="🖼️ Unsplash Gallery">
      {showKeyInput ? (
        <div className="bg-white rounded-xl p-6">
          <p className="mb-2">Enter your Unsplash Access Key (free from unsplash.com/developers)</p>
          <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="border rounded-lg p-2 w-full mb-2" />
          <button onClick={saveKey} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Save Key</button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search photos..." className="flex-1 border rounded-lg p-2" />
            <button onClick={search} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Search</button>
          </div>
          {loading && <p>Loading...</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="bg-white rounded-lg overflow-hidden shadow">
                <img src={photo.urls.small} alt={photo.alt_description} className="w-full h-48 object-cover" />
                <div className="p-2 text-sm text-gray-600">📸 {photo.user.name}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </PublicLayout>
  );
};

export default GalleryPage;