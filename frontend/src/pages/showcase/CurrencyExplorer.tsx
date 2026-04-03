import { useState, useEffect } from 'react';
import PublicLayout from '../../components/PublicLayout';

const CurrencyExplorer = () => {
  const [rates, setRates] = useState<any>(null);
  const [amount, setAmount] = useState(1);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => setRates(data.rates));
  }, []);

  const convert = () => {
    if (!rates) return;
    let converted: number;
    if (fromCurr === 'USD') converted = amount * rates[toCurr];
    else if (toCurr === 'USD') converted = amount / rates[fromCurr];
    else converted = amount * (rates[toCurr] / rates[fromCurr]);
    setResult(converted);
  };

  useEffect(() => { convert(); }, [amount, fromCurr, toCurr, rates]);

  return (
    <PublicLayout title="💱 Currency Explorer">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="border rounded-lg p-2 w-32" />
          <select value={fromCurr} onChange={e => setFromCurr(e.target.value)} className="border rounded-lg p-2">
            {rates && Object.keys(rates).slice(0, 20).map(c => <option key={c}>{c}</option>)}
          </select>
          <span>→</span>
          <select value={toCurr} onChange={e => setToCurr(e.target.value)} className="border rounded-lg p-2">
            {rates && Object.keys(rates).slice(0, 20).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="text-2xl font-bold">{result?.toFixed(2)} {toCurr}</div>
      </div>
    </PublicLayout>
  );
};

export default CurrencyExplorer;