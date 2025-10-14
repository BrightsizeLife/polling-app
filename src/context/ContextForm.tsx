// src/context/ContextForm.tsx
// Component for collecting optional user context during onboarding
// Allows users to provide non-identifying information like age and city

import { useState } from 'react';
import { auth } from '../firebase';
import { saveContext, markOnboardingDone } from '../db';

export default function ContextForm() {
  // Form state - both fields are optional
  const [age, setAge] = useState<string>('');        // String for input, converted to number later
  const [city, setCity] = useState<string>('');

  // UI state for save operation
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('Not signed in. Please refresh and try again.');
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const ageValue = age.trim() ? parseInt(age.trim(), 10) : null;
      const cityValue = city.trim() || null;

      if (ageValue !== null && (isNaN(ageValue) || ageValue < 0 || ageValue > 120)) {
        setErrorMessage('Age must be a number between 0 and 120');
        setSaveStatus('error');
        setIsSaving(false);
        return;
      }

      await saveContext(user.uid, {
        age: ageValue,
        city: cityValue
      });

      await markOnboardingDone(user.uid);

      setSaveStatus('success');
      console.log('[ContextForm] ✅ Context saved and onboarding complete');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);

    } catch (error: any) {
      console.error('[ContextForm] ❌ Error saving context:', error);
      setErrorMessage(error.message || 'Failed to save. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '24px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 0,
        marginBottom: '8px'
      }}>
        Your Context
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#64748b',
        marginTop: 0,
        marginBottom: '24px'
      }}>
        Help us personalize your experience (optional)
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#334155',
          marginBottom: '6px'
        }}>
          Age (optional)
        </label>
        <input
          type="number"
          min="0"
          max="120"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="e.g., 25"
          disabled={isSaving}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#334155',
          marginBottom: '6px'
        }}>
          City (optional)
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., San Francisco"
          disabled={isSaving}
          maxLength={100}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{
          width: '100%',
          padding: '12px',
          background: isSaving ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          marginBottom: '12px'
        }}
        onMouseOver={(e) => {
          if (!isSaving) e.currentTarget.style.background = '#2563eb';
        }}
        onMouseOut={(e) => {
          if (!isSaving) e.currentTarget.style.background = '#3b82f6';
        }}
      >
        {isSaving ? '💾 Saving...' : '💾 Save Context'}
      </button>

      {saveStatus === 'success' && (
        <div style={{
          padding: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ✅ Context saved successfully!
        </div>
      )}

      {saveStatus === 'error' && (
        <div style={{
          padding: '12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ❌ {errorMessage}
        </div>
      )}

      <p style={{
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '16px',
        marginBottom: 0,
        lineHeight: '1.5'
      }}>
        🔒 <strong>Privacy:</strong> This information is private and only used to personalize your experience.
        We collect minimal, non-identifying data. You can skip any field or leave everything blank.
      </p>
    </div>
  );
}
