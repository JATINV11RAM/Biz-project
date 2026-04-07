import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface HistoryItem {
  id: number;
  tool_name: string;
  request: string;
  response: string;
  credits_used: number;
  created_at: string;
}

export default function History() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchHistory(token);
  }, []);

  const fetchHistory = async (token: string) => {
    try {
      const res = await fetch('/api/user/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const toolEmojis: { [key: string]: string } = {
    'whatsapp-writer': '💬',
    'poster-maker': '📱',
    'profit-advisor': '📈',
    'gst-helper': '📊',
    'review-replier': '⭐'
  };

  const toolNames: { [key: string]: string } = {
    'whatsapp-writer': 'WhatsApp Writer',
    'poster-maker': 'Poster Maker',
    'profit-advisor': 'Profit Advisor',
    'gst-helper': 'GST Helper',
    'review-replier': 'Review Replier'
  };

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(item => item.tool_name === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition">
              <span className="text-xl font-bold text-gray-800">← Back to Dashboard</span>
            </Link>
            <span className="text-gray-800 font-bold">Usage History</span>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Usage History</h1>
          <p className="text-gray-600">View your past AI tool requests and responses</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <p className="text-sm font-semibold text-gray-600 mb-3">Filter by Tool:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All Tools
            </button>

            {Object.entries(toolNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {toolEmojis[key]} {name}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow-lg text-center">
            <p className="text-gray-600 text-lg mb-4">No usage history yet</p>
            <p className="text-gray-500 mb-6">Start using AI tools to see your history here</p>
            <Link href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
              Go to Tools
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{toolEmojis[item.tool_name] || '🤖'}</span>
                    <div>
                      <p className="font-bold text-gray-800">{toolNames[item.tool_name] || item.tool_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    -{item.credits_used} credits
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Request:</p>
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {item.request}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">AI Response:</p>
                    <div className="bg-blue-50 p-4 rounded border border-blue-200">
                      <p className="text-gray-800 text-sm leading-relaxed line-clamp-5">
                        {item.response}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.response);
                      alert('Response copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
                  >
                    📋 Copy Response
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {filteredHistory.length > 0 && (
          <div className="mt-8 text-center text-gray-600 text-sm">
            Showing {filteredHistory.length} of {history.length} requests
          </div>
        )}
      </div>
    </div>
  );
}
