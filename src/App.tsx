import { useState } from 'react';
import CreateQuestion from './questions/CreateQuestion';

export default function App() {
  const [activeTab, setActiveTab] = useState<'ask' | 'explore' | 'you'>('ask');

  const tabButton = (tab: typeof activeTab, emoji: string, label: string) => ({
    padding: '16px 24px',
    border: 'none',
    background: 'transparent',
    fontSize: '16px',
    fontWeight: '500',
    color: activeTab === tab ? '#3b82f6' : '#6b7280',
    borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    transition: 'color 0.2s'
  });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #e5e7eb' }}>
        <div role="tablist" style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
          <button
            role="tab"
            aria-selected={activeTab === 'ask'}
            onClick={() => setActiveTab('ask')}
            style={tabButton('ask', '📝', 'Ask')}
          >
            📝 Ask
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'explore'}
            onClick={() => setActiveTab('explore')}
            style={tabButton('explore', '🔍', 'Explore')}
          >
            🔍 Explore
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'you'}
            onClick={() => setActiveTab('you')}
            style={tabButton('you', '👤', 'You')}
          >
            👤 You
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 0' }}>
        {activeTab === 'ask' && <CreateQuestion />}

        {activeTab === 'explore' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Explore Feed Coming Soon
            </h2>
            <p style={{ margin: 0 }}>Discover and answer questions from the community</p>
          </div>
        )}

        {activeTab === 'you' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            {/* Stats */}
            <div style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>0</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Rep</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>0</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Energy</div>
              </div>
            </div>

            {/* Profile */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                Your Profile
              </h3>
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Profile settings coming soon
              </div>
            </div>

            {/* My Questions */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                My Questions
              </h3>
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Your created questions will appear here
              </div>
            </div>

            {/* My Answers */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                My Answers
              </h3>
              <div style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Your poll responses will appear here
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
