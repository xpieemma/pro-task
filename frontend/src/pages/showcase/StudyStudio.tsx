import { useState, useRef, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

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

  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to call AI with a POST request
  const callAI = async (prompt: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai', // or whatever pollinations expects
        }),
        signal: controller.signal,
      });
      const text = await res.text();
      return text;
    } catch (err) {
      throw err;
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const generateFlashcards = async () => {
    setLoadingFlash(true);
    try {
      const prompt = `Generate exactly 5-8 flashcards as a JSON array of objects with "question" and "answer" properties. Use these notes:\n${notes}\n\nReturn ONLY the JSON array, no extra text.`;
      const raw = await callAI(prompt);
      if (!raw) return;
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      const parsed = JSON.parse(jsonMatch[0]);
      const valid = Array.isArray(parsed) && parsed.every(item => item.question && item.answer);
      if (!valid) throw new Error('Invalid flashcard format');
      setFlashcards(parsed);
      setCurrentCard(0);
      setShowAnswer(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate flashcards');
    } finally {
      setLoadingFlash(false);
    }
  };

  const generateDiscussion = async () => {
    setLoadingDisc(true);
    try {
      const prompt = `Generate 4 discussion questions with hints as a JSON array of objects with "question" and "hint" properties. Use these notes:\n${notes}\n\nReturn ONLY the JSON array, no extra text.`;
      const raw = await callAI(prompt);
      if (!raw) return;
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      const parsed = JSON.parse(jsonMatch[0]);
      const valid = Array.isArray(parsed) && parsed.every(item => item.question && item.hint);
      if (!valid) throw new Error('Invalid discussion format');
      setDiscussion(parsed);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate discussion questions');
    } finally {
      setLoadingDisc(false);
    }
  };

  const generateAll = async () => {
    if (!notes.trim()) return toast.error('Enter some notes first');
    await Promise.allSettled([generateFlashcards(), generateDiscussion()]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <PublicLayout title="📚 Study Studio">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={10}
            className="w-full border rounded-lg p-3 mb-3"
            placeholder="Paste your notes here..."
          />
          <button
            onClick={generateAll}
            disabled={loadingFlash || loadingDisc}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loadingFlash || loadingDisc ? 'Generating...' : 'Generate Study Materials'}
          </button>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {/* Flashcards */}
          {flashcards.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-2">Flashcards</h3>
              <div
                className="border rounded-lg p-4 cursor-pointer"
                onClick={() => setShowAnswer(!showAnswer)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowAnswer(!showAnswer)}
                tabIndex={0}
                role="button"
              >
                <div className="font-semibold">
                  {showAnswer ? flashcards[currentCard].answer : flashcards[currentCard].question}
                </div>
                <div className="text-xs text-gray-400 mt-2">Click or press Enter to flip</div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => { setCurrentCard(prev => Math.max(0, prev - 1)); setShowAnswer(false); }}
                  disabled={currentCard === 0}
                  className="text-gray-600 disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span>{currentCard + 1} / {flashcards.length}</span>
                <button
                  onClick={() => { setCurrentCard(prev => Math.min(flashcards.length - 1, prev + 1)); setShowAnswer(false); }}
                  disabled={currentCard === flashcards.length - 1}
                  className="text-gray-600 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Discussion Questions */}
          {discussion.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-2">Discussion Questions</h3>
              <div className="space-y-3">
                {discussion.map((q, i) => (
                  <details key={i} className="border-b pb-2">
                    <summary className="cursor-pointer font-medium">{q.question}</summary>
                    <p className="text-sm text-amber-700 mt-1">💡 {q.hint}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {!loadingFlash &&
            <p className="text-center text-gray-500">Generating flashcards...</p>}
            {loadingDisc && <p className="text-center text-gray-500">Creating discussion questions...</p>} 
        </div>
      </div>
    </PublicLayout>
  );
};

export default StudyStudio;