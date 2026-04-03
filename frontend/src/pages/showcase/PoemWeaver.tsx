import { useState, useRef, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const PoemWeaver = () => {
  const [poemLines, setPoemLines] = useState<{ text: string; author: 'user' | 'ai' }[]>([]);
  const [userLine, setUserLine] = useState('');
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [hint, setHint] = useState('');
  
  // ✅ Manage Groq API Key locally
  const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
  const [isKeySetup, setIsKeySetup] = useState(!!localStorage.getItem('groq_api_key'));

  const abortControllerRef = useRef<AbortController | null>(null);

  const saveApiKey = (key: string) => {
    if (!key.trim() || !key.startsWith('gsk_')) {
      return toast.error('Please enter a valid Groq API key (starts with gsk_)');
    }
    localStorage.setItem('groq_api_key', key.trim());
    setApiKey(key.trim());
    setIsKeySetup(true);
    toast.success('Groq API Key saved locally!');
  };

  const addLine = (text: string, author: 'user' | 'ai') => {
    setPoemLines(prev => [...prev, { text, author }]);
  };

  // ✅ Groq API Integration (Blazing Fast LPU)
  const askAI = async (context: string) => {
    if (!apiKey) return toast.error('Groq API Key is missing.');

    setWaitingForAI(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const timeoutSignal = AbortSignal.timeout(15000);
      const combinedSignal = AbortSignal.any ? AbortSignal.any([controller.signal, timeoutSignal]) : controller.signal;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Fast, open-source model perfect for poetry
          messages: [
            { 
              role: 'system', 
              content: 'You are a poet collaborating with a human. Continue this poem with exactly ONE line. Keep the same mood and style. Do not add quotes, introductory text, or conversational filler. Just write the next line.' 
            },
            { role: 'user', content: context }
          ],
          temperature: 0.8,
          max_tokens: 60
        }),
        signal: combinedSignal
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      
      const data = await res.json();
      const aiLine = data.choices[0]?.message?.content || '';
      
      addLine(aiLine.trim(), 'ai');
    } catch (err: any) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        console.error('Groq Error:', err);
        toast.error('AI failed to respond. Please try again.');
      }
    } finally {
      setWaitingForAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!userLine.trim()) return;
    addLine(userLine.trim(), 'user');
    setUserLine('');
    setHint('');
    
    const context = poemLines.map(l => l.text).join('\n') + '\n' + userLine.trim();
    await askAI(context);
  };

  // ✅ Groq API Integration for Hints
  const getHint = async () => {
    if (!apiKey) return toast.error('Groq API Key is missing.');
    if (poemLines.length === 0) {
      setHint('Start with an image or a feeling.');
      return;
    }

    const context = poemLines.map(l => l.text).join('\n');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: 'Give a short, inspiring hint (one sentence max) for the next line of this poem. Be creative.' },
            { role: 'user', content: context }
          ],
          temperature: 0.7,
          max_tokens: 40
        })
      });

      if (!res.ok) throw new Error('Failed to get hint');
      const data = await res.json();
      setHint(data.choices[0]?.message?.content?.trim() || "Think about contrast or a surprising word.");
    } catch {
      setHint("Think about contrast, repetition, or a surprising word.");
    }
  };

  const reset = () => {
    setPoemLines([]);
    setUserLine('');
    setHint('');
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <PublicLayout title="📜 Poem Weaver (Powered by Groq)">
      
      {/* API Key Setup Banner */}
      {!isKeySetup && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-orange-800 mb-2">Connect Groq API</h3>
          <p className="text-sm text-orange-600 mb-4">
            This tool requires a free Groq API key to generate poetry at blazing fast speeds. Your key is stored securely in your browser's local storage.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste your Groq API Key (gsk_...)"
              className="flex-1 border border-orange-300 rounded-lg p-2 focus:ring-2 focus:ring-orange-400 outline-none"
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button 
              onClick={() => saveApiKey(apiKey)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Save Key
            </button>
          </div>
          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline mt-2 inline-block">
            Get a free API key from Groq Console &rarr;
          </a>
        </div>
      )}

      {isKeySetup && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Poem</h2>
            <button 
              onClick={() => {
                localStorage.removeItem('groq_api_key');
                setIsKeySetup(false);
                setApiKey('');
              }} 
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Disconnect API Key
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg border">
            {poemLines.map((line, idx) => (
              <div key={idx} className={`p-3 rounded shadow-sm ${line.author === 'user' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-orange-50 border-l-4 border-orange-500'}`}>
                <span className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1 block">
                  {line.author === 'user' ? 'You' : 'Groq AI'}
                </span> 
                <p className="text-gray-800 whitespace-pre-wrap font-serif text-lg">{line.text}</p>
              </div>
            ))}
            {waitingForAI && (
              <div className="p-3 rounded shadow-sm bg-orange-50 border-l-4 border-orange-300 animate-pulse">
                <span className="font-bold text-xs uppercase tracking-wider text-orange-400 mb-1 block">Groq AI</span> 
                <p className="text-orange-600 font-serif text-lg">Writing...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={userLine}
              onChange={(e) => setUserLine(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Your next line..."
              className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-400 outline-none"
              disabled={waitingForAI}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSubmit} 
                disabled={waitingForAI} 
                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 flex-1 sm:flex-none"
              >
                Submit
              </button>
              <button 
                onClick={getHint} 
                className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Hint
              </button>
              <button 
                onClick={reset} 
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          {hint && (
            <div className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
              <span className="text-amber-500">💡</span> 
              <p>{hint}</p>
            </div>
          )}
        </div>
      )}
    </PublicLayout>
  );
};

export default PoemWeaver;