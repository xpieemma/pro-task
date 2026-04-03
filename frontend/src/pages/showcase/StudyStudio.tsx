import { useState, useRef, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Flashcard {
  question: string;
  answer: string;
}

interface DiscussionQ {
  question: string;
  hint: string;
}

const StudyStudio = () => {
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [discussion, setDiscussion] = useState<DiscussionQ[]>([]);
  const [loadingFlash, setLoadingFlash] = useState(false);
  const [loadingDisc, setLoadingDisc] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // ✅ Manage Gemini API Key locally
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

  // ✅ Gemini API Integration with Native JSON Mode
  const callGemini = async (prompt: string, signal: AbortSignal) => {
    if (!apiKey) throw new Error('API_KEY_MISSING');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json", // 🔥 Forces 100% valid JSON output
      }
    });

    const timeoutSignal = AbortSignal.timeout(30000);
    const combinedSignal = AbortSignal.any ? AbortSignal.any([signal, timeoutSignal]) : signal;

    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { signal: combinedSignal }
    );
    
    return result.response.text();
  };

  const generateFlashcards = async () => {
    setLoadingFlash(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const prompt = `Generate exactly 5 to 8 flashcards from the following notes. Return a JSON array of objects, where each object has a "question" string and an "answer" string. Notes to use:\n\n${notes}`;
      const rawJson = await callGemini(prompt, controller.signal);

      const parsed = JSON.parse(rawJson);
      const valid = Array.isArray(parsed) && parsed.every(i => i.question && i.answer);
      if (!valid) throw new Error("Invalid flashcard format returned by AI");

      setFlashcards(parsed);
      setCurrentCard(0);
      setShowAnswer(false);
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING') return toast.error('Gemini API Key is missing.');
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
         console.error(err);
         toast.error("Failed to generate flashcards");
      }
    } finally {
      setLoadingFlash(false);
    }
  };

  const generateDiscussion = async () => {
    setLoadingDisc(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const prompt = `Generate exactly 4 discussion questions based on the following notes. Return a JSON array of objects, where each object has a "question" string and a "hint" string to guide the student. Notes to use:\n\n${notes}`;
      const rawJson = await callGemini(prompt, controller.signal);
      
      const parsed = JSON.parse(rawJson);
      const valid = Array.isArray(parsed) && parsed.every(item => item.question && item.hint);
      if (!valid) throw new Error('Invalid discussion format returned by AI');
      
      setDiscussion(parsed);
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING') return; // Handled by flashcards error
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
         console.error(err);
         toast.error('Failed to generate discussion questions');
      }
    } finally {
      setLoadingDisc(false);
    }
  };

  const generateAll = async () => {
    if (!notes.trim()) return toast.error('Enter some notes first');
    if (!apiKey) return toast.error('Please connect your Gemini API Key first.');
    await Promise.allSettled([generateFlashcards(), generateDiscussion()]);
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <PublicLayout title="📚 Study Studio (Powered by Gemini)">
      
      {/* API Key Setup Banner */}
      {!isKeySetup && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">Connect Google Gemini</h3>
          <p className="text-sm text-blue-600 mb-4">
            This tool uses Google Gemini to process massive amounts of study notes. Your free API key is stored securely in your browser.
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
          <a href="[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
            Get a free API key from Google AI Studio &rarr;
          </a>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 relative">
          
          {isKeySetup && (
            <button 
              onClick={() => {
                localStorage.removeItem('gemini_api_key');
                setIsKeySetup(false);
                setApiKey('');
              }} 
              className="absolute top-4 right-6 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Disconnect API Key
            </button>
          )}

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Notes</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={12}
            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
            placeholder="Paste your lecture notes, textbook chapters, or study guides here..."
            disabled={!isKeySetup}
          />
          <button
            onClick={generateAll}
            disabled={!isKeySetup || loadingFlash || loadingDisc}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg disabled:opacity-50 hover:bg-gray-900 transition-colors font-medium"
          >
            {loadingFlash || loadingDisc ? 'Gemini is reading your notes...' : 'Generate Study Materials'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {/* Flashcards */}
          {flashcards.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4 text-gray-800">Flashcards</h3>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors min-h-[200px] flex flex-col justify-center items-center"
                onClick={() => setShowAnswer(!showAnswer)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); 
                    setShowAnswer(!showAnswer);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={showAnswer}
              >
                <div className="font-semibold text-xl text-center text-gray-800">
                  {showAnswer ? flashcards[currentCard].answer : flashcards[currentCard].question}
                </div>
                <div className="text-sm text-gray-400 mt-6 font-medium uppercase tracking-widest">
                  {showAnswer ? 'Answer' : 'Question'} (Spacebar to flip)
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => { setCurrentCard(prev => Math.max(0, prev - 1)); setShowAnswer(false); }}
                  disabled={currentCard === 0}
                  className="text-blue-600 font-medium disabled:opacity-30 hover:text-blue-800 transition-colors"
                >
                  &larr; Previous
                </button>
                <span className="font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {currentCard + 1} / {flashcards.length}
                </span>
                <button
                  onClick={() => { setCurrentCard(prev => Math.min(flashcards.length - 1, prev + 1)); setShowAnswer(false); }}
                  disabled={currentCard === flashcards.length - 1}
                  className="text-blue-600 font-medium disabled:opacity-30 hover:text-blue-800 transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Discussion Questions */}
          {discussion.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4 text-gray-800">Discussion Questions</h3>
              <div className="space-y-4">
                {discussion.map((q, i) => (
                  <details key={i} className="border border-gray-100 rounded-lg p-4 group bg-gray-50">
                    <summary className="cursor-pointer font-medium text-gray-800 group-hover:text-blue-600 transition-colors outline-none list-none flex justify-between items-center">
                      <span>{i + 1}. {q.question}</span>
                      <span className="text-gray-400 text-sm ml-4 group-open:hidden">Show Hint &darr;</span>
                    </summary>
                    <div className="bg-white rounded-md p-3 mt-3 text-sm text-gray-600 border border-gray-200 shadow-sm leading-relaxed">
                      💡 <strong>Hint:</strong> {q.hint}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {loadingFlash && (
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium animate-pulse">Building your flashcards...</p>
            </div>
          )}
          {loadingDisc && !loadingFlash && (
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-500 font-medium animate-pulse">Drafting discussion questions...</p>
            </div>
          )} 
        </div>
      </div>
    </PublicLayout>
  );
};

export default StudyStudio;