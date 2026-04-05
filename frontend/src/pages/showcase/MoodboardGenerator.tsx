import { useState, useEffect, useCallback } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const MoodboardGenerator = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('unsplash_key') || '');
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('unsplash_key'));

  const saveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    localStorage.setItem('unsplash_key', apiKey.trim());
    setShowKeyInput(false);
    toast.success('Key saved! Try searching a vibe.');
    fetchPhotos('aesthetic workspace'); // default query
  };

  const removeKey = () => {
    localStorage.removeItem('unsplash_key');
    setApiKey('');
    setShowKeyInput(true);
    setPhotos([]);
  };

  const fetchPhotos = useCallback(async (searchQuery: string) => {
    const currentKey = localStorage.getItem('unsplash_key');
    if (!currentKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    try {
      // We specifically request 'landscape' orientation for a better moodboard look
      const url = searchQuery
        ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=9&orientation=landscape`
        : `https://api.unsplash.com/photos?per_page=9&orientation=landscape`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${currentKey}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.errors?.[0] || `HTTP Error ${res.status}`);
      }

      const newPhotos = searchQuery ? data.results : data;
      setPhotos(Array.isArray(newPhotos) ? newPhotos : []);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to generate moodboard');
      setPhotos([]); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('unsplash_key')) {
      fetchPhotos('neon city'); // Default vibe
    }
  }, [fetchPhotos]);

  // Utility to copy the hex code to the user's clipboard
  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex} to clipboard!`);
  };

  return (
    <PublicLayout title="🎨 Color & Vibe Moodboard">
      
      {showKeyInput ? (
        <div className="bg-purple-50 border border-purple-200 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-purple-900 mb-2">Connect Unsplash</h3>
          <p className="mb-4 text-purple-700 text-sm">
            This tool uses Unsplash's hidden metadata to generate UI color palettes based on image aesthetics. Enter your Access Key to start.
          </p>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && saveKey()}
              placeholder="Paste Access Key here"
              className="border border-purple-300 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-purple-400 outline-none" 
            />
            <button 
              onClick={saveKey} 
              className="bg-purple-700 text-white px-6 py-2 rounded-lg hover:bg-purple-800 transition-colors shadow-sm"
            >
              Save Key
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Design Palette Extractor</h2>
              <p className="text-sm text-gray-500">Search an aesthetic, and we will extract the dominant hex colors.</p>
            </div>
            <button 
              onClick={removeKey} 
              className="text-xs text-gray-400 hover:text-red-500 transition-colors bg-gray-50 px-3 py-1.5 rounded-md"
            >
              Disconnect API Key
            </button>
          </div>

          <div className="flex gap-2 mb-8">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && fetchPhotos(query)} 
              placeholder="Enter a vibe (e.g. 'Cyberpunk', 'Forest Cabin', 'Pastel Sunrise')..." 
              className="flex-1 border-2 border-gray-100 rounded-xl p-4 focus:border-purple-400 focus:ring-0 outline-none text-lg shadow-inner transition-colors" 
            />
            <button 
              onClick={() => fetchPhotos(query)} 
              disabled={loading}
              className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-black transition-colors disabled:opacity-50 font-medium tracking-wide"
            >
              {loading ? 'Extracting...' : 'Generate Vibes'}
            </button>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          )}

          {!loading && photos.length === 0 && query && (
             <div className="text-center py-12 text-gray-500">
               No inspiration found for "{query}". Try something else!
             </div>
          )}

          {!loading && photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {photos.map(photo => (
                <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                  {/* The Image */}
                  <div className="relative h-48 w-full group">
                    <img 
                      src={photo.urls.small} 
                      alt={photo.alt_description || 'Inspiration image'} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                    <a 
                      href={photo.links.html} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium backdrop-blur-sm"
                    >
                      View on Unsplash
                    </a>
                  </div>
                  
                  {/* The Color Swatch Extractor */}
                  <div className="p-4 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      {/* Using the actual photo.color from the Unsplash API! */}
                      <div 
                        className="w-10 h-10 rounded-full shadow-inner border border-black/10 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: photo.color || '#E5E7EB' }}
                        onClick={() => copyToClipboard(photo.color || '#E5E7EB')}
                        title="Click to copy color"
                      ></div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Dominant Color</div>
                        <div className="text-sm font-mono font-bold text-gray-800">{photo.color || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => copyToClipboard(photo.color || '#E5E7EB')}
                      className="text-gray-400 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      Copy Hex
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PublicLayout>
  );
};

export default MoodboardGenerator;