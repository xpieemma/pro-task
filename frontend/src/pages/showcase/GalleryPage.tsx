import { useState, useEffect, useCallback } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const GalleryPage = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('unsplash_key') || '');
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Only show key input if we don't have one in local storage
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('unsplash_key'));

  const saveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    localStorage.setItem('unsplash_key', apiKey.trim());
    setShowKeyInput(false);
    toast.success('Key saved!');
    fetchPhotos(''); // Fetch default photos immediately after saving
  };

  const removeKey = () => {
    localStorage.removeItem('unsplash_key');
    setApiKey('');
    setShowKeyInput(true);
    setPhotos([]);
  };

  // ✅ Wrapped in useCallback so we can safely run it in useEffect
  const fetchPhotos = useCallback(async (searchQuery: string) => {
    const currentKey = localStorage.getItem('unsplash_key');
    if (!currentKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    try {
      const url = searchQuery
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=12`
        : `https://api.unsplash.com/photos?per_page=12`;

      // ✅ Securely pass API key in Headers, not in the URL string
      const res = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${currentKey}`
        }
      });

      const data = await res.json();

      // ✅ Catch HTTP errors (401, 403, 404) BEFORE trying to map the data
      if (!res.ok) {
        throw new Error(data.errors?.[0] || `HTTP Error ${res.status}`);
      }

      // Safely extract the array
      const newPhotos = searchQuery ? data.results : data;
      setPhotos(Array.isArray(newPhotos) ? newPhotos : []);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load images');
      setPhotos([]); // ✅ Fallback to empty array to prevent map() crashes
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch default photos on mount if key exists
  useEffect(() => {
    if (localStorage.getItem('unsplash_key')) {
      fetchPhotos('');
    }
  }, [fetchPhotos]);

  return (
    <PublicLayout title="🖼️ Unsplash Gallery">
      
      {showKeyInput ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-2">Connect Unsplash</h3>
          <p className="mb-4 text-gray-600 text-sm">
            Enter your free Unsplash Access Key (from unsplash.com/developers). It will be saved securely in your browser.
          </p>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && saveKey()}
              placeholder="Paste Access Key here"
              className="border border-gray-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-gray-400 outline-none" 
            />
            <button 
              onClick={saveKey} 
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Search Images</h2>
            {/* ✅ Allows user to fix a broken API key */}
            <button 
              onClick={removeKey} 
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Disconnect API Key
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && fetchPhotos(query)} // ✅ Support Enter key
              placeholder="Search for anything (e.g. 'cyberpunk city', 'minimalist workspace')..." 
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none" 
            />
            <button 
              onClick={() => fetchPhotos(query)} 
              disabled={loading}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          )}

          {!loading && photos.length === 0 && query && (
             <div className="text-center py-12 text-gray-500">
               No photos found for "{query}". Try a different search term.
             </div>
          )}

          {!loading && photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <a 
                  key={photo.id} 
                  href={photo.links.html} // Links directly to Unsplash page (per Unsplash API guidelines)
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative block"
                >
                  <img 
                    src={photo.urls.small} 
                    alt={photo.alt_description || 'Unsplash image'} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="text-xs text-white font-medium truncate">
                      📸 {photo.user.name}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </PublicLayout>
  );
};

export default GalleryPage;