// src/questions/CreateQuestion.tsx
// Component for creating new poll questions
// Supports single choice, rating, numeric, and date question types

import { useState } from 'react';
import { createQuestion, QuestionType } from '../db';
import { auth } from '../firebase';
import { useAuthReady } from '../hooks/useAuthReady';

export default function CreateQuestion() {
  // Wait for auth to be ready to prevent flicker
  const authReady = useAuthReady();
  // Form state
  const [text, setText] = useState('');
  const [type, setType] = useState<QuestionType>('single');

  // Type-specific state
  const [options, setOptions] = useState(''); // Comma-separated options for 'single' type
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('5');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate user is authenticated
    if (!auth.currentUser) {
      setError('You must be signed in to create questions');
      return;
    }

    // Validate question text
    if (!text.trim()) {
      setError('Question text is required');
      return;
    }

    // Type-specific validation
    if (type === 'single') {
      const optionsList = options.split(',').map(o => o.trim()).filter(o => o.length > 0);
      if (optionsList.length === 0) {
        setError('Please provide at least one option (comma-separated)');
        return;
      }
    }

    if (type === 'rating' || type === 'numeric') {
      const minVal = parseInt(min);
      const maxVal = parseInt(max);
      if (isNaN(minVal) || isNaN(maxVal)) {
        setError('Min and max must be valid numbers');
        return;
      }
      if (minVal >= maxVal) {
        setError('Max value must be greater than min value');
        return;
      }
    }

    // Submit to Firestore
    setIsSubmitting(true);
    try {
      // Build payload based on question type
      const payload: any = { text, type };

      if (type === 'single') {
        payload.options = options.split(',').map(o => o.trim()).filter(o => o.length > 0);
      }

      if (type === 'rating' || type === 'numeric') {
        payload.min = parseInt(min);
        payload.max = parseInt(max);
      }

      // Create the question
      const questionId = await createQuestion(auth.currentUser.uid, payload);

      console.log('[CreateQuestion] ✅ Question created successfully:', questionId);

      // Reset form on success
      setText('');
      setOptions('');
      setMin('1');
      setMax('5');
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error('[CreateQuestion] ❌ Error creating question:', err);
      setError(err.message || 'Failed to create question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render type-specific fields based on selected question type
  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'single':
        return (
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Options (comma-separated) *
            </label>
            <input
              type="text"
              placeholder="e.g., Red, Blue, Green, Yellow"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Separate each option with a comma
            </p>
          </div>
        );

      case 'rating':
      case 'numeric':
        return (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Min Value *
              </label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Max Value *
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        );

      case 'date':
        return (
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Users will select a date from a calendar picker
          </p>
        );
    }
  };

  // Show loading state while auth initializes (prevents flicker)
  if (!authReady) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#9ca3af', fontSize: '14px' }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show friendly sign-in prompt if not authenticated
  if (!auth.currentUser) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px'
      }}>
        <div style={{
          background: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            Sign in to create polls
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '0'
          }}>
            Please sign in using the button in the header to start creating poll questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '24px'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '8px'
      }}>
        Create a Poll Question
      </h2>
      <p style={{
        color: '#6b7280',
        fontSize: '14px',
        marginBottom: '24px'
      }}>
        Ask your audience anything and gauge the vibe
      </p>

      {/* Success Message */}
      {success && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#166534',
          fontSize: '14px'
        }}>
          ✅ Question created successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Question Text */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Question Text *
          </label>
          <input
            type="text"
            placeholder="e.g., What's your favorite color?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Question Type */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Question Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="single">Single Choice</option>
            <option value="rating">Rating Scale</option>
            <option value="numeric">Numeric Input</option>
            <option value="date">Date Picker</option>
          </select>
        </div>

        {/* Type-Specific Fields */}
        {renderTypeSpecificFields()}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          style={{
            width: '100%',
            padding: '12px',
            background: isSubmitting || !text.trim() ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isSubmitting || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isSubmitting ? '✨ Creating...' : '✨ Create Question'}
        </button>
      </form>
    </div>
  );
}
