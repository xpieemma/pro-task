import { Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';

const tools = [
  { path: '/showcase/poem', emoji: '📜', name: 'Poem Weaver', desc: 'Collaborative poem writing with AI' },
  { path: '/showcase/story', emoji: '📖', name: 'Story Weaver', desc: 'You write first 3 lines, AI continues' },
  { path: '/showcase/weather', emoji: '🌤️', name: 'Weather Mood', desc: 'Live weather + creative messages' },
  { path: '/showcase/gallery', emoji: '🖼️', name: 'Infinite Inspiration', desc: 'Unsplash image gallery (API key required)' },
  { path: '/showcase/currency', emoji: '💱', name: 'Currency Explorer', desc: 'Real‑time exchange rates' },
  { path: '/showcase/study', emoji: '📚', name: 'Study Studio', desc: 'Notes → AI flashcards & discussion' },
  { path: '/showcase/spotify', emoji: '🎧', name: 'Spotify Vibe', desc: 'Your top tracks & artists (OAuth)' },
  { path: '/showcase/resume', emoji: '📄', name: 'My Resume', desc: 'GitHub repos + professional experience' },
];

const Showcase = () => {
  return (
    <PublicLayout title="API Showcase Portfolio">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
          >
            <div className="text-4xl mb-3">{tool.emoji}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{tool.name}</h2>
            <p className="text-gray-600 text-sm">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </PublicLayout>
  );
};

export default Showcase;