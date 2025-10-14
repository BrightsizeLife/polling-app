import { useState } from 'react';
import CreateQuestion from './questions/CreateQuestion';

export default function App() {
  // Tab state: 'ask' or 'answer' (for future)
  const [activeTab, setActiveTab] = useState<'ask' | 'answer'>('ask');

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
            onClick={() => setActiveTab('ask')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '16px',
              fontWeight: '500',
              color: activeTab === 'ask' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'ask' ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            📝 Ask
          </button>
          <button
            onClick={() => setActiveTab('answer')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'transparent',
              fontSize: '16px',
              fontWeight: '500',
              color: activeTab === 'answer' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'answer' ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            ✅ Answer
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px 0' }}>
        {activeTab === 'ask' && <CreateQuestion />}
        {activeTab === 'answer' && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '24px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p>Answer tab coming soon! This is where you'll see and respond to polls.</p>
          </div>
        )}
      </div>
    </div>
  );
}
