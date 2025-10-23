// src/questions/AnswerQuestion.tsx
// Answer a question and view results after submitting

import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { submitResponse, getResponses, hasAnswered } from '../db';
import { useAuthReady } from '../hooks/useAuthReady';

interface Props {
  question: any;
  onBack: () => void;
}

export default function AnswerQuestion({ question, onBack }: Props) {
  const authReady = useAuthReady();
  const [value, setValue] = useState<any>('');
  const [submitting, setSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    if (auth.currentUser) {
      hasAnswered(question.id, auth.currentUser.uid).then(setAnswered);
    }
  }, [question.id]);

  useEffect(() => {
    if (answered) {
      getResponses(question.id).then(setResponses);
    }
  }, [answered, question.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !value) return;

    setSubmitting(true);
    try {
      await submitResponse(question.id, auth.currentUser.uid, value);
      setAnswered(true);
      const newResponses = await getResponses(question.id);
      setResponses(newResponses);
    } catch (err) {
      console.error('[Answer] Submit failed:', err);
      alert('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth check
  if (!authReady) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;
  if (!auth.currentUser) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          Sign in to answer
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Please sign in to participate in polls.</p>
        <button onClick={onBack} style={{ marginTop: '16px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Back to Explore
        </button>
      </div>
    );
  }

  // Results rendering helpers
  const renderResults = () => {
    if (question.type === 'single') {
      return question.options.map((opt: string) => {
        const count = responses.filter(r => r.value === opt).length;
        const pct = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
        return (
          <div key={opt} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
              <span>{opt}</span><span>{count} ({pct}%)</span>
            </div>
            <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px' }}>
              <div style={{ background: '#3b82f6', height: '100%', width: `${pct}%` }}></div>
            </div>
          </div>
        );
      });
    }

    if (question.type === 'rating' || question.type === 'numeric') {
      const values = responses.map(r => r.value);
      const n = values.length;
      const mean = n > 0 ? (values.reduce((a, b) => a + b, 0) / n).toFixed(1) : '0';
      const sorted = values.slice().sort((a, b) => a - b);
      const median = n > 0 ? (n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)]) : 0;
      const sd = n > 0 ? Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - Number(mean), 2), 0) / n).toFixed(1) : '0';
      return (
        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            <div><div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{mean}</div><div style={{ fontSize: '12px', color: '#6b7280' }}>Mean</div></div>
            <div><div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{median}</div><div style={{ fontSize: '12px', color: '#6b7280' }}>Median</div></div>
            <div><div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{sd}</div><div style={{ fontSize: '12px', color: '#6b7280' }}>SD</div></div>
          </div>
        </div>
      );
    }

    if (question.type === 'date') {
      const dateCounts: Record<string, number> = {};
      responses.forEach(r => {
        const date = new Date(r.value).toLocaleDateString();
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      });
      return Object.entries(dateCounts).sort().map(([date, count]) => (
        <div key={date} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
          <span>{date}</span><span>{count}</span>
        </div>
      ));
    }
  };

  // Results view (after answered)
  if (answered) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
        <button onClick={onBack} style={{ marginBottom: '16px', padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          ← Back
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>{question.text}</h2>
        {renderResults()}
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>Responses: {responses.length}</p>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' };

  // Answer form
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <button onClick={onBack} style={{ marginBottom: '16px', padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        ← Back
      </button>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>{question.text}</h2>
      <form onSubmit={handleSubmit}>
        {question.type === 'single' && question.options.map((opt: string) => (
          <label key={opt} style={{ display: 'block', padding: '12px', marginBottom: '8px', background: '#f9fafb', borderRadius: '6px', cursor: 'pointer' }}>
            <input type="radio" name="option" value={opt} onChange={e => setValue(e.target.value)} style={{ marginRight: '8px' }} />
            {opt}
          </label>
        ))}
        {(question.type === 'rating' || question.type === 'numeric') && (
          <input type="number" min={question.min} max={question.max} value={value} onChange={e => setValue(Number(e.target.value))}
            placeholder={`${question.min} to ${question.max}`} style={inputStyle} />
        )}
        {question.type === 'date' && <input type="date" value={value} onChange={e => setValue(e.target.value)} style={inputStyle} />}
        <button type="submit" disabled={!value || submitting} style={{
          width: '100%', marginTop: '16px', padding: '12px', background: !value || submitting ? '#9ca3af' : '#3b82f6',
          color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '500',
          cursor: !value || submitting ? 'not-allowed' : 'pointer'
        }}>
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
