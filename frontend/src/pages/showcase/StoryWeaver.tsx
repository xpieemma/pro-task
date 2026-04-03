import { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const StoryWeaver = () => {
  const [segments, setSegments] = useState<{ text: string; author: 'user' | 'ai' }[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'first_three' | 'waiting_ai' | 'user_two_more'>('first_three');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const addSegment = (text: string, author: 'user' | 'ai') => {
    setSegments(prev => [...prev, { text, author }]);
  };

  const callAI = async (storySoFar: string) => {
    setLoading(true);
    try {
      const prompt = `Continue this story with exactly ONE sentence:\n${storySoFar}\nNext sentence:`;
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const sentence = await res.text();
      setAiSuggestion(sentence.trim());
      setPhase('user_two_more');
      setInput(`[AI suggestion: ${sentence.trim()}]\n\nNow write at least two sentences (you can edit the AI line above).`);
    } catch {
      toast.error('AI failed. Write manually.');
      setPhase('user_two_more');
      setInput('Write at least two sentences to continue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (phase === 'first_three') {
      const lines = input.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 3) {
        toast.error('Please write at least three lines to start.');
        return;
      }
      for (let i = 0; i < 3; i++) addSegment(lines[i].trim(), 'user');
      setInput('');
      setPhase('waiting_ai');
      const story = segments.map(s => s.text).join('\n') + '\n' + lines.slice(0,3).join('\n');
      await callAI(story);
    } else if (phase === 'user_two_more') {
      // remove temporary AI note if present
      // const cleaned = input.replace(/\[AI suggestion:.*?\]\n\n/, '');
      const cleaned = input.replace(/\[AI suggestion:[\s\S]*?\]\s*/i, '').trim();
      const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
      if (sentences.length < 2) {
        toast.error('You must write at least two sentences.');
        return;
      }
      addSegment(cleaned.trim(), 'user');
      setInput('');
      setPhase('waiting_ai');
      const fullStory = segments.map(s => s.text).join('\n') + '\n' + cleaned;
      await callAI(fullStory);
    }
  };

  const reset = () => {
    setSegments([]);
    setInput('');
    setPhase('first_three');
    setAiSuggestion('');
  };

  return (
    <PublicLayout title="📖 Story Weaver">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {segments.map((seg, idx) => (
            <div key={idx} className={`p-2 rounded ${seg.author === 'user' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-orange-50 border-l-4 border-orange-500'}`}>
              <span className="font-semibold">{seg.author === 'user' ? 'You' : 'AI'}:</span> {seg.text}
            </div>
          ))}
        </div>
        {aiSuggestion && (
  <div className="p-2 bg-orange-50 border-l-4 border-orange-500 rounded mb-2">
    <strong>AI Suggestion:</strong> {aiSuggestion}
    <button
      className="ml-2 text-blue-600 underline"
      onClick={() => setInput(prev => aiSuggestion + "\n\n" + prev)}
    >
      Insert
    </button>
  </div>
)}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          className="w-full border rounded-lg p-3 mb-3"
          placeholder={phase === 'first_three' ? 'Write the first three lines of your story...' : 'Write your continuation...'}
          disabled={loading}
        />
        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={loading} className="bg-gray-800 text-white px-4 py-2 rounded-lg">
            {loading ? 'AI thinking...' : 'Submit'}
          </button>
          <button onClick={reset} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">Reset</button>
        </div>
        {phase === 'waiting_ai' && <p className="mt-2 text-gray-500">AI is writing the next sentence...</p>}
      </div>
    </PublicLayout>
  );
};

export default StoryWeaver;