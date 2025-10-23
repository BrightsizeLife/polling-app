// src/questions/ExploreQuestions.tsx
// Browse and select approved questions to answer

import { useState, useEffect } from 'react';
import { getApprovedQuestions } from '../db';
import AnswerQuestion from './AnswerQuestion';

export default function ExploreQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  useEffect(() => {
    getApprovedQuestions()
      .then(setQuestions)
      .catch(err => console.error('[Explore] Failed to load questions:', err))
      .finally(() => setLoading(false));
  }, []);

  if (selectedQuestion) {
    return <AnswerQuestion question={selectedQuestion} onBack={() => setSelectedQuestion(null)} />;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        Loading questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          No Questions Yet
        </h2>
        <p style={{ margin: 0 }}>Check back soon for new polls to answer!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
        Explore Questions
      </h2>
      {questions.map(q => (
        <div
          key={q.id}
          onClick={() => setSelectedQuestion(q)}
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            cursor: 'pointer',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
            {q.text}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {q.type === 'single' && '📊 Single Choice'}
            {q.type === 'rating' && '⭐ Rating'}
            {q.type === 'numeric' && '🔢 Numeric'}
            {q.type === 'date' && '📅 Date'}
          </div>
        </div>
      ))}
    </div>
  );
}
