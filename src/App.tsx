import { useState } from 'react';
import ContextForm from './context/ContextForm';

export default function App() {
  // Tab state: 'home' or 'you'
  const [activeTab, setActiveTab] = useState<'home' | 'you'>('home');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Tab Navigation */}
      <div style={{
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '0'
      }}>
        <div style={{
          display: 'flex',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '16px',
              fontWeight: '500',
              color: activeTab === 'home' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'home' ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            🏠 Home
          </button>
          <button
            onClick={() => setActiveTab('you')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '16px',
              fontWeight: '500',
              color: activeTab === 'you' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'you' ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            👤 You
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px 0' }}>
        {activeTab === 'home' && (
          <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <h1>🗳️ Polling App</h1>
            <p>Welcome to the polling application! Authentication is working.</p>
            <p>This is a placeholder for your polling app features.</p>
          </div>
        )}
        {activeTab === 'you' && <ContextForm />}
      </div>
    </div>
  );
}
