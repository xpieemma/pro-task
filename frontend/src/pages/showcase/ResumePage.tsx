import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';

const ResumePage = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const GITHUB_USERNAME = 'xpieemma'; // github username

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`)
      .then(res => res.json())
      .then(data => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PublicLayout title="📄 Resume & Portfolio">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Your Name</h2>
          <p className="text-gray-600">Software Engineer Apprentice Candidate</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span>📍 Newark, NJ</span>
            <a href="https://github.com/your-username" className="text-blue-600">GitHub</a>
            <a href="https://linkedin.com/in/your-profile" className="text-blue-600">LinkedIn</a>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Technical Skills</h3>
          <div className="flex flex-wrap gap-2">
            {['JavaScript','TypeScript','React','Node.js','Express','MongoDB','Tailwind','Git'].map(skill => (
              <span key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{skill}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">GitHub Projects</h3>
          {loading ? <p>Loading repos...</p> : (
            <div className="grid md:grid-cols-2 gap-4">
              {repos.map(repo => (
                <div key={repo.id} className="border rounded-lg p-3">
                  <a href={repo.html_url} target="_blank" className="font-semibold text-blue-600">{repo.name}</a>
                  <p className="text-sm text-gray-600">{repo.description || 'No description'}</p>
                  <div className="text-xs text-gray-400 mt-1">⭐ {repo.stargazers_count} · 🍴 {repo.forks_count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResumePage;