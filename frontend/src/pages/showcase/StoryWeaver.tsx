import { useState, useRef, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';

const StoryWeaver = () => {
  const [segments, setSegments] = useState<{ text: string; author: 'user' | 'ai' }[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'first_three' | 'waiting_ai' | 'user_two_more'>('first_three');
  const [loading, setLoading] = useState(false);
  
  // ✅ Manage Gemini API Key locally (Zero backend required, 100% secure)
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [isKeySetup, setIsKeySetup] = useState(!!localStorage.getItem('gemini_api_key'));

  const abortControllerRef = useRef<AbortController | null>(null);

  const saveApiKey = (key: string) => {
    if (!key.trim()) return toast.error('Please enter a valid API key');
    localStorage.setItem('gemini_api_key', key.trim());
    setApiKey(key.trim());
    setIsKeySetup(true);
    toast.success('Gemini API Key saved locally!');
  };

  const addSegment = (text: string, author: 'user' | 'ai') => {
    setSegments(prev => [...prev, { text, author }]);
  };

  // ✅ Gemini API Integration
  const callAI = async (storySoFar: string) => {
    if (!apiKey) {
      toast.error('Gemini API Key is missing.');
      return;
    }

    setLoading(true);
    try {
      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      // Gemini 1.5 Flash is lightning fast and free
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a creative co-author. Continue this story with exactly ONE sentence. Do not include any conversational filler, introductory text, or quotes. Just write the next sentence:\n\n${storySoFar}\n\nNext sentence:`;
      
      const result = await model.generateContent(prompt);
      const sentence = result.response.text();
      
      addSegment(sentence.trim(), 'ai');
      setPhase('user_two_more');
      setInput(''); 
      
    } catch (err: any) {
      console.error('Gemini Error:', err);
      toast.error('AI failed to respond. Check your API key or write manually.');
      setPhase('user_two_more');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    if (phase === 'first_three') {
      const lines = input.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 3) {
        toast.error('Please write at least three lines to start.');
        return;
      }
      
      addSegment(input.trim(), 'user');
      setInput('');
      setPhase('waiting_ai');
      
      const story = segments.map(s => s.text).join('\n\n') + '\n\n' + input.trim();
      await callAI(story);

    } else if (phase === 'user_two_more') {
      // Safe sentence counting for Safari compatibility
      const sentences = input.match(/[^.!?]+[.!?]*/g)?.filter(s => s.trim().length > 0) || [];
      
      if (sentences.length < 2) {
        toast.error('You must write at least two sentences.');
        return;
      }

      addSegment(input.trim(), 'user');
      setInput('');
      setPhase('waiting_ai');
      
      const fullStory = segments.map(s => s.text).join('\n\n') + '\n\n' + input.trim();
      await callAI(fullStory);
    }
  };

  const reset = () => {
    setSegments([]);
    setInput('');
    setPhase('first_three');
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <PublicLayout title="📖 Story Weaver (Powered by Gemini)">
      
      {/* API Key Setup Banner */}
      {!isKeySetup && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">Connect Google Gemini</h3>
          <p className="text-sm text-blue-600 mb-4">
            This tool requires a free Google Gemini API key to run client-side. Your key is stored securely in your browser's local storage and never touches our servers.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste your Gemini API Key here"
              className="flex-1 border border-blue-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button 
              onClick={() => saveApiKey(apiKey)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Key
            </button>
          </div>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
            Get a free API key from Google AI Studio &rarr;
          </a>
        </div>
      )}

      {isKeySetup && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Story</h2>
            <button 
              onClick={() => {
                localStorage.removeItem('gemini_api_key');
                setIsKeySetup(false);
                setApiKey('');
              }} 
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Disconnect API Key
            </button>
          </div>

          {/* Story Log */}
          {segments.length > 0 && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg border">
              {segments.map((seg, idx) => (
                <div key={idx} className={`p-3 rounded shadow-sm ${seg.author === 'user' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                  <span className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1 block">
                    {seg.author === 'user' ? 'You' : 'Gemini AI'}
                  </span> 
                  <p className="text-gray-800 whitespace-pre-wrap">{seg.text}</p>
                </div>
              ))}
              {phase === 'waiting_ai' && (
                <div className="p-3 rounded shadow-sm bg-blue-50 border-l-4 border-blue-300 animate-pulse">
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-400 mb-1 block">Gemini AI</span> 
                  <p className="text-blue-600">Thinking of the next sentence...</p>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="w-full border rounded-lg p-3 mb-3 focus:ring-2 focus:ring-gray-400 outline-none transition-shadow"
            placeholder={phase === 'first_three' ? 'Write the first three lines of your story (press Enter between lines)...' : 'Write at least two sentences to continue the story...'}
            disabled={loading}
          />
          
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Gemini is typing...' : 'Submit Continuation'}
            </button>
            <button 
              onClick={reset} 
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};

export default StoryWeaver;