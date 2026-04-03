import { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const StudyStudio = () => {
  const [notes, setNotes] = useState('');
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [discussion, setDiscussion] = useState<{ question: string; hint: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const generate = async () => {
    if (!notes.trim()) return toast.error('Enter some notes first');
    setLoading(true);
    try {
      // Flashcards
      const flashRes = await fetch(`https://text.pollinations.ai/Generate 5-8 flashcards as JSON array from these notes: ${encodeURIComponent(notes)}`);
      let flashText = await flashRes.text();
      const flashMatch = flashText.match(/\[[\s\S]*\]/);
      const newFlash = flashMatch ? JSON.parse(flashMatch[0]) : [];
      setFlashcards(newFlash);
      // Discussion questions
      const discRes = await fetch(`https://text.pollinations.ai/Generate 4 discussion questions with hints as JSON array from: ${encodeURIComponent(notes)}`);
      let discText = await discRes.text();
      const discMatch = discText.match(/\[[\s\S]*\]/);
      const newDisc = discMatch ? JSON.parse(discMatch[0]) : [];
      setDiscussion(newDisc);
      setCurrentCard(0);
      setShowAnswer(false);
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout title="📚 Study Studio">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={10} className="w-full border rounded-lg p-3 mb-3" placeholder="Paste your notes here..." />
          <button onClick={generate} disabled={loading} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Generate Study Materials</button>
        </div>
        <div className="space-y-6">
          {flashcards.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-2">Flashcards</h3>
              <div className="border rounded-lg p-4 cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
                <div className="font-semibold">{showAnswer ? flashcards[currentCard].answer : flashcards[currentCard].question}</div>
                <div className="text-xs text-gray-400 mt-2">Click to flip</div>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => { setCurrentCard(Math.max(0, currentCard-1)); setShowAnswer(false); }} disabled={currentCard===0} className="text-gray-600">← Previous</button>
                <span>{currentCard+1}/{flashcards.length}</span>
                <button onClick={() => { setCurrentCard(Math.min(flashcards.length-1, currentCard+1)); setShowAnswer(false); }} className="text-gray-600">Next →</button>
              </div>
            </div>
          )}
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
        </div>
      </div>
    </PublicLayout>
  );
};

export default StudyStudio;