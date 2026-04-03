import { useState } from 'react';
import PublicLayout from '../../components/PublicLayout';
import toast from 'react-hot-toast';

const PoemWeaver = () => {
  const [poemLines, setPoemLines] = useState<{ text: string; author: 'user' | 'ai' }[]>([]);
  const [userLine, setUserLine] = useState('');
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [hint, setHint] = useState('');

  const addLine = (text: string, author: 'user' | 'ai') => {
    setPoemLines(prev => [...prev, { text, author }]);
  };

  const askAI = async (context: string) => {
    setWaitingForAI(true);
    try {
      const prompt = `You are a poet collaborating with a human. Continue this poem with exactly ONE line. Keep the same mood and style. Do not add extra text.\n\n${context}\n\nYour next line:`;
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const aiLine = await res.text();
      addLine(aiLine.trim(), 'ai');
    } catch (error) {
      toast.error('AI failed. Please try again.');
    } finally {
      setWaitingForAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!userLine.trim()) return;
    addLine(userLine.trim(), 'user');
    setUserLine('');
    setHint('');
    const context = poemLines.map(l => l.text).join('\n') + '\n' + userLine;
    await askAI(context);
  };

  const getHint = async () => {
    if (poemLines.length === 0) {
      setHint('Start with an image or a feeling.');
      return;
    }
    const context = poemLines.map(l => l.text).join('\n');
    const prompt = `Give a short hint (one sentence) for the next line of this poem:\n${context}`;
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const hintText = await res.text();
      setHint(hintText);
    } catch {
      setHint('Think about contrast, repetition, or a surprising word.');
    }
  };

  const reset = () => {
    setPoemLines([]);
    setUserLine('');
    setHint('');
  };

  return (
    <PublicLayout title="📜 Poem Weaver">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
          {poemLines.map((line, idx) => (
            <div key={idx} className={`p-2 rounded ${line.author === 'user' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-orange-50 border-l-4 border-orange-500'}`}>
              <span className="font-semibold">{line.author === 'user' ? 'You' : 'AI'}:</span> {line.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={userLine}
            onChange={(e) => setUserLine(e.target.value)}
            placeholder="Your next line..."
            className="flex-1 border rounded-lg px-4 py-2"
            disabled={waitingForAI}
          />
          <button onClick={handleSubmit} disabled={waitingForAI} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Submit</button>
          <button onClick={getHint} className="bg-gray-200 px-4 py-2 rounded-lg">Hint</button>
          <button onClick={reset} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">Reset</button>
        </div>
        {hint && <p className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded">💡 {hint}</p>}
      </div>
    </PublicLayout>
  );
};

export default PoemWeaver;