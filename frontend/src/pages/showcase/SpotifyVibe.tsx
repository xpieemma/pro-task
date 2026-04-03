import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PublicLayout from '../../components/PublicLayout';


const CLIENT_ID_STORAGE = 'spotify_client_id';

// type SpotifyTrack = {
//   id: string;
//   name: string;
//   album : {
//     images: { url: string }[];
//   };
//   artists: { name: string }[];
// };


const SpotifyVibe = () => {
  const [clientId, setClientId] = useState(localStorage.getItem(CLIENT_ID_STORAGE) || '');
  const [accessToken, setAccessToken] = useState('');
  const [profile, setProfile] = useState<SpotifyApi.CurrentUsersProfileResponse | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyApi.TrackObjectFull[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyApi.ArtistObjectFull[]>([]);
  const [editingClientId, setEditingClientId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('short_term');

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
    const token = params.get('access_token');
    if (token) {
      setAccessToken(token);
      window.history.pushState({}, '', window.location.pathname);
      fetchAllData(token);
    }
  }, []);

  // const saveClientId = () => {
  //   localStorage.setItem(CLIENT_ID_STORAGE, clientId);
  //   toast.success('Client ID saved');
  // };

  const login = () => {
    if (!clientId) return alert('Set your Spotify Client ID first');
    const redirectUri = `${window.location.origin}/showcase/spotify`;
    const scopes = 'user-top-read user-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };



  const fetchProfile = async (token: string) => {
 
    const res = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } });
    // const data = await res.json();
    // setProfile(data);
    if (!res.ok) {
      toast.error("Failed to load Spotify data");
      return;
    }
    const data: SpotifyApi.CurrentUsersProfileResponse = await res.json();
    setProfile(data);
  };

  const fetchTopItems = async (token: string) => {
    const tracksRes = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=${range}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!tracksRes.ok) {
      toast.error("Failed to load top tracks");
      return;
    }
    // const tracks = await tracksRes.json();
    const tracks: SpotifyApi.UsersTopTracksResponse = await tracksRes.json();
    setTopTracks(tracks.items);

    const artistsRes = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=5&time_range=${range}`, { headers: { Authorization: `Bearer ${token}` } });

    if (!artistsRes.ok) {
      toast.error("Failed to load top artists");
      return;
    }

    // const artists = await artistsRes.json();
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

      {/* Client ID input (initial or editing) */}
      {(!clientId || editingClientId) && (
        <div className="mb-4">
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="Spotify Client ID"
            className="border rounded-lg p-2 w-full mb-2"
          />
          <button
            onClick={() => {
              localStorage.setItem(CLIENT_ID_STORAGE, clientId);
              toast.success('Client ID saved');
              setEditingClientId(false);
            }}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
          >
            Save Client ID
          </button>
        </div>
      )}

      {/* Edit button (only when saved and not editing) */}
      {clientId && !editingClientId && (
        <button
          onClick={() => setEditingClientId(true)}
          className="text-sm text-blue-600 underline mb-4"
        >
          Edit Client ID
        </button>
      )}

      {/* Login button */}
      {clientId && !accessToken && (
        <button
          onClick={login}
          className="bg-green-600 text-white px-6 py-3 rounded-full"
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
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
              <button onClick={logout} className="text-sm text-red-500">
                Log out
              </button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
  <h3 className="font-bold">Your Vibe</h3>
  <p>
    {vibeScore >= 5
      ? "🔥 Highly active listener"
      : "🎧 Casual listener"}
  </p>
</div>
{/* Time Range Toggle */}
<div className="flex gap-2 mb-4">
  {['short_term', 'medium_term', 'long_term'].map(r => (
    <button
      key={r}
      onClick={() => {
        setRange(r);
        if (accessToken) fetchAllData(accessToken);
      }}
      className={`px-3 py-1 rounded ${
        range === r ? 'bg-black text-white' : 'bg-gray-200'
      }`}
    >
      {r.replace('_', ' ')}
    </button>
  ))}
</div>

<div className="grid md:grid-cols-2 gap-6"></div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">Top Tracks (Month)</h3>
              {topTracks.map(track => (
                <div key={track.id || track.name} className="flex items-center gap-2 mb-2">
                  <img
                    src={track.album.images.at(-1)?.url || "/fallback.jpg"}
                    className="w-10 h-10 rounded"
                  />
                  <div>
                    <div>{track.name}</div>
                    <div className="text-xs text-gray-500">
                      {track.artists.map(a => a.name).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold mb-2">Top Artists</h3>
              {topArtists.map(artist => (
                <div key={artist.id} className="flex items-center gap-2 mb-2">
                  <img
                    src={artist.images.at(-1)?.url || "/fallback.jpg"}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>{artist.name}</div>
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