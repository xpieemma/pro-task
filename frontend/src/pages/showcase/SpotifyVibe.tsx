import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PublicLayout from '../../components/PublicLayout';

const CLIENT_ID_STORAGE = 'spotify_client_id';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

const SpotifyVibe = () => {
  const [clientId, setClientId] = useState<string>(localStorage.getItem(CLIENT_ID_STORAGE) || '');
  const [accessToken, setAccessToken] = useState<string>('');
  const [profile, setProfile] = useState<SpotifyApi.CurrentUsersProfileResponse | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyApi.ArtistObjectFull[]>([]);
  const [editingClientId, setEditingClientId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<TimeRange>('short_term');

  const fetchAllData = async (token: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProfile(token),
        fetchTopItems(token),
      ]);
    } catch (err) {
      toast.error("Error loading Spotify data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token') as string | null;
    
    if (token) {
      setAccessToken(token);
  
      window.history.pushState({}, '', window.location.pathname);
      fetchAllData(token);
    }
  }, []);

  const login = () => {
    if (!clientId) return alert('Set your Spotify Client ID first');
    const redirectUri = `${window.location.origin}/showcase/spotify`;
    const scopes = 'user-top-read user-read-private';
    
const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };

  const fetchProfile = async (token: string) => {
  
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` } 
    });
  
    if (!res.ok) {
      toast.error("Failed to load Spotify profile");
      return;
    }
    const data: SpotifyApi.CurrentUsersProfileResponse = await res.json();
    setProfile(data);
  };

  const fetchTopItems = async (token: string) => {

const tracksRes = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${range}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!tracksRes.ok) {
      toast.error("Failed to load top tracks");
      return;
    }
    
    const tracks: SpotifyApi.UsersTopTracksResponse = await tracksRes.json();
    setTopTracks(tracks.items);

    
 const artistsRes = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${range}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` } 
    });

    if (!artistsRes.ok) {
      toast.error("Failed to load top artists");
      return;
    }

    const artists: SpotifyApi.UsersTopArtistsResponse = await artistsRes.json();
    setTopArtists(artists.items);
  };

  const vibeScore = topTracks.length;

  const logout = () => {
    setAccessToken('');
    setProfile(null);
    setTopTracks([]);
    setTopArtists([]);
  };

  return (
    <PublicLayout title="🎧 Spotify Vibe Checker">
      <div className="bg-white rounded-xl shadow-sm p-6">
      
        {(!clientId || editingClientId) && (
          <div className="mb-4">
            <input
              type="text"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              placeholder="Spotify Client ID"
              className="border rounded-lg p-2 w-full mb-2 outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={() => {
                localStorage.setItem(CLIENT_ID_STORAGE, clientId);
                toast.success('Client ID saved');
                setEditingClientId(false);
              }}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Save Client ID
            </button>
          </div>
        )}

        {clientId && !editingClientId && (
          <button
            onClick={() => setEditingClientId(true)}
            className="text-sm text-blue-600 hover:underline mb-4"
          >
            Edit Client ID
          </button>
        )}

        {clientId && !accessToken && (
          <button
            onClick={login}
            className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition"
          >
            Log in with Spotify
          </button>
        )}
        
        {loading && (
          <div className="text-center py-6 text-gray-500">
            Loading your Spotify data…
          </div>
        )}

        {!loading && accessToken && profile && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              {profile.images?.at(-1) && (
                <img
                  src={profile.images?.at(-1)?.url || "/fallback.jpg"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">{profile.display_name}</h2>
                <button onClick={logout} className="text-sm text-red-500 hover:underline">
                  Log out
                </button>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 text-green-900 rounded-lg mb-6 border border-green-200">
              <h3 className="font-bold">Your Vibe</h3>
              <p>
                {vibeScore >= 5
                  ? "🔥 Highly active listener"
                  : "🎧 Casual listener"}
              </p>
            </div>

            <div className="flex gap-2 mb-6">
              {(['short_term', 'medium_term', 'long_term'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setRange(r);
                    if (accessToken) {
                      
                      fetchTopItems(accessToken); 
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                    range === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4 text-gray-800 uppercase tracking-wider text-sm">Top Tracks</h3>
                {topTracks.map(track => (
                  <div key={track.id || track.name} className="flex items-center gap-3 mb-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition">
                    <img
                      src={track.album.images.at(-1)?.url || "/fallback.jpg"}
                      alt={track.name}
                      className="w-12 h-12 rounded shadow-sm object-cover"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{track.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-bold mb-4 text-gray-800 uppercase tracking-wider text-sm">Top Artists</h3>
                {topArtists.map(artist => (
                  <div key={artist.id} className="flex items-center gap-3 mb-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition">
                    <img
                      src={artist.images.at(-1)?.url || "/fallback.jpg"}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full shadow-sm object-cover"
                    />
                    <div className="font-semibold text-gray-800 truncate">{artist.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default SpotifyVibe;