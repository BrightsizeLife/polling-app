// src/questions/AnswerQuestion.tsx
// Answer a question and view results after submitting

import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { submitResponse, hasAnswered } from '../db';
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

  useEffect(() => {
    if (auth.currentUser) {
      hasAnswered(question.id, auth.currentUser.uid).then(setAnswered);
    }
  }, [question.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !value) return;

    setSubmitting(true);
    try {
      await submitResponse(question.id, auth.currentUser.uid, value);
      setAnswered(true);
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

  // Success view (after answered)
  if (answered) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          Response Saved
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Thank you for participating!</p>
        <button onClick={onBack} style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
          Back to Explore
        </button>
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
