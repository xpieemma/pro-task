import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';

const ResumePage = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const GITHUB_USERNAME = 'xpieemma';
const [emailLabel, setEmailLabel] =useState("Email");
const EMAIL = "9973education@gmail.com";

const revealEmail = () => {
  setEmailLabel(EMAIL);
  setTimeout(() => setEmailLabel("Email"), 3000);
};
  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`)
      .then(res => res.json())
      .then(data => {
        // Safe check to ensure we received an array before setting state
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PublicLayout title="📄 Resume & Portfolio">
      <div className="bg-white rounded-xl shadow-sm max-w-3xl mx-auto p-8 sm:p-12 font-sans text-gray-800 leading-relaxed">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-light tracking-wide mb-1">E. Pierre</h1>
          <div className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-3">
            Software Engineer | Educator | Philosopher
          </div>
          <div className="text-xs text-gray-500 flex flex-wrap gap-4">
            <span>📍 Newark, NJ</span>
            <a href={"https://linkedin.com/in/epierr14"} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">LinkedIn</a>
            <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">GitHub</a>
            <span> <button 
      onClick={revealEmail} 
      className="hover:text-blue-600 transition-colors cursor-pointer uppercase tracking-widest text-[10px] font-normal"
    >
      {emailLabel}
    </button>               </span>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200 my-5"></div>

        {/* TECHNICAL SKILLS */}
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-4">
          Technical skills
        </div>
        <div className="mb-6">
          <div className="mb-3">
            <div className="text-[11px] font-medium text-gray-500 mb-1.5">Languages</div>
            <div className="flex flex-wrap gap-1.5">
              {['JavaScript', 'HTML5', 'CSS3', 'Java'].map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 border border-gray-200 rounded text-gray-500 font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <div className="text-[11px] font-medium text-gray-500 mb-1.5">Testing & automation</div>
            <div className="flex flex-wrap gap-1.5">
              {['Playwright', 'Selenium WebDriver', 'TestNG'].map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 border border-gray-200 rounded text-gray-500 font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-1.5">Tools & workflow</div>
            <div className="flex flex-wrap gap-1.5">
              {['Git', 'Node.js', 'MongoDB', 'Express', 'React', 'Cursor / Windsurf'].map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 border border-gray-200 rounded text-gray-500 font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200 my-5"></div>

        {/* PROJECTS & GITHUB */}
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-4">
          Projects & Open Source
        </div>
        <div className="mb-6">
          <div className="mb-5 border-l-2 border-gray-300 pl-3">
            <div className="font-medium text-sm text-gray-800">Hacker News automated testing suite</div>
            <div className="text-[11px] text-gray-400 font-mono mb-2 mt-0.5">Playwright · TypeScript · end-to-end automation</div>
            <ul className="pl-4 list-none space-y-1.5">
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Designed and executed an end-to-end automated testing script targeting Hacker News using Microsoft Playwright.</li>
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Implemented robust selector strategies to reduce flakiness against dynamic web elements.</li>
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Applied QA judgment developed at Infosys to validate test coverage and script reliability.</li>
            </ul>
          </div>

          {/* GitHub Integration */}
          <div className="font-medium text-sm text-gray-800 mb-3 mt-5">GitHub Repository Highlights</div>
          {loading ? (
            <div className="text-xs text-gray-500 animate-pulse bg-gray-50 p-4 rounded-lg">Fetching repositories...</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {repos.slice(0, 4).map(repo => (
                <div key={repo.id} className="border border-gray-200 bg-gray-50 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-semibold text-xs text-blue-600 hover:underline truncate block">
                    {repo.name}
                  </a>
                  <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2 min-h-[32px]">
                    {repo.description || 'No description provided'}
                  </p>
                  <div className="text-[10px] text-gray-400 mt-2.5 font-mono flex gap-3">
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    {repo.language && <span>💻 {repo.language}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-[1px] bg-gray-200 my-5"></div>

        {/* EXPERIENCE */}
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-4">
          Experience
        </div>
        <div className="space-y-6 mb-6">
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-medium text-sm text-gray-800">Case Manager</span>
              <span className="text-[11px] text-gray-400">2023 – Present</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">DPS Tax Services · Maplewood, NJ</div>
            <ul className="pl-4 list-none space-y-1.5">
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Managed immigration workflows and documentation across a high-volume caseload, requiring precision and systematic tracking.</li>
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Coordinated with internal and external stakeholders to streamline service delivery and resolve blockers — a direct analog to cross-functional engineering collaboration.</li>
            </ul>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-medium text-sm text-gray-800">Educator & Math Instructor</span>
              <span className="text-[11px] text-gray-400">Aug 2024 – Jun 2025</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">North Star Academy · Newark, NJ</div>
            <ul className="pl-4 list-none space-y-1.5">
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Adapted complex mathematical concepts to diverse learning styles — a skill that maps directly to writing clear documentation and explaining technical decisions to non-technical stakeholders.</li>
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Used data from student performance tracking to inform iterative adjustments, mirroring a data-driven engineering approach.</li>
            </ul>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-medium text-sm text-gray-800">QA / Automation Engineer</span>
              <span className="text-[11px] text-gray-400">2022 – 2023</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Infosys · Bridgewater, NJ</div>
            <ul className="pl-4 list-none space-y-1.5">
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Wrote automated test scripts and documented QA processes in an enterprise environment.</li>
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Participated in agile development cycles, gaining hands-on SDLC and collaborative team experience.</li>
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Reviewed test outputs for accuracy and alignment with project specifications — a habit that now informs how I audit AI-generated code.</li>
            </ul>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-medium text-sm text-gray-800">Math Instructor & Tutor</span>
              <span className="text-[11px] text-gray-400">Dec 2021 – Jul 2022</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Essex County College · Newark, NJ</div>
            <ul className="pl-4 list-none space-y-1.5">
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Taught advanced algebra and mentored students from diverse backgrounds, building communication and problem-breakdown skills applicable to technical collaboration.</li>
            </ul>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200 my-5"></div>

        {/* EDUCATION */}
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-4">
          Training & education
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-medium text-sm text-gray-800">Full Stack MERN Training</span>
              <span className="text-[11px] text-gray-400">Expected Apr 2026</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">Per Scholas · Remote</div>
            <ul className="pl-4 list-none space-y-1.5">
              <li className="relative text-xs text-gray-600 pl-4 before:content-['—'] before:absolute before:-left-1 before:text-gray-400">Hands-on training in MongoDB, Express, React, and Node.js — completing before the July 2026 program start date.</li>
            </ul>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-medium text-sm text-gray-800">B.A. Applied Mathematics & Philosophy</span>
              <span className="text-[11px] text-gray-400">May 2020</span>
            </div>
            <div className="text-xs text-gray-500">Rutgers University · Newark, NJ</div>
            <div className="text-[11px] text-gray-400 italic mt-1">Charles I. Biederman SASN Award recipient</div>
          </div>
        </div>
  <div className="h-[1px] bg-gray-200 my-5"></div>

  <div className="text-xs text-gray-500 flex flex-wrap gap-4">
            <span><strong className="text-gray-700">French</strong> - <em>Fluent</em></span>
            <span><strong className="text-gray-700">Haitian Creole</strong> - <em>Native</em></span>
            </div>

    <div className="h-[1px] bg-gray-200 my-5"></div>
         {/* AI COLLABORATION */}
        <div className="text-[10px] font-medium tracking-widest uppercase text-gray-400 mb-4">
          AI collaboration & engineering workflow
        </div>
        <div className="bg-gray-50 rounded-md p-4 mb-6 space-y-3">
          <div className="flex gap-2.5 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
            <div className="text-xs text-gray-600">Uses AI as a tool — brainstorming architecture, generating boilerplate, and refining test scripts to accelerate delivery.</div>
          </div>
          <div className="flex gap-2.5 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
            <div className="text-xs text-gray-600">Reviews all AI-generated output for accuracy, security vulnerabilities, and project alignment before implementation.</div>
          </div>
          <div className="flex gap-2.5 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
            <div className="text-xs text-gray-600">Experienced with AI-native IDEs (Cursor, Windsurf)</div>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
};

export default ResumePage;