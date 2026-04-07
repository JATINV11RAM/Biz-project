import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ToolResponse {
  response?: string;
  credits_used?: number;
  credits_remaining?: number;
  error?: string;
}

const toolConfig: { [key: string]: any } = {
  'whatsapp-writer': {
    name: '💬 WhatsApp Writer',
    icon: '💬',
    description: 'Write professional WhatsApp messages',
    placeholder: 'What message do you want to write? (e.g., "Write a thank you message to a customer")',
    color: 'from-green-400 to-green-600'
  },
  'poster-maker': {
    name: '📱 Poster Maker',
    icon: '📱',
    description: 'Create social media captions',
    placeholder: 'What should I create? (e.g., "Create an Instagram post for a sale")',
    color: 'from-pink-400 to-pink-600'
  },
  'profit-advisor': {
    name: '📈 Profit Advisor',
    icon: '📈',
    description: 'Get business strategies',
    placeholder: 'What business challenge are you facing? (e.g., "How to increase profits?")',
    color: 'from-yellow-400 to-yellow-600'
  },
  'gst-helper': {
    name: '📊 GST Helper',
    icon: '📊',
    description: 'GST compliance guidance',
    placeholder: 'What GST question do you have? (e.g., "GST filing deadline for small business")',
    color: 'from-purple-400 to-purple-600'
  },
  'review-replier': {
    name: '⭐ Review Replier',
    icon: '⭐',
    description: 'Professional review responses',
    placeholder: 'What review should I respond to? (e.g., "Respond to negative review about slow service")',
    color: 'from-red-400 to-red-600'
  }
};

export default function Tool() {
  const router = useRouter();
  const { id } = router.query;
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchCredits(token);
    }
  }, [id]);

  const fetchCredits = async (token: string) => {
    try {
      const res = await fetch('/api/user/credits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCredits(data.credits_remaining);
    } catch (err) {
      console.error('Failed to fetch credits');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/ai/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: input })
      });

      const data: ToolResponse = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred');
        return;
      }

      setResponse(data.response || '');
      setCredits(data.credits_remaining || credits);
      setInput('');

      // Add to history
      setHistory([
        {
          input,
          response: data.response,
          timestamp: new Date()
        },
        ...history
      ]);
    } catch (err) {
      setError('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const config = toolConfig[id as string];
  if (!config) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition">
              <span className="text-xl font-bold text-gray-800">← Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                {config.icon}
              </div>
              <span className="font-bold text-gray-800">{config.name}</span>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
              {credits} credits
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Tool Header */}
        <div className={`bg-gradient-to-r ${config.color} rounded-lg p-8 text-white mb-8`}>
          <h1 className="text-4xl font-bold mb-2">{config.name}</h1>
          <p className="text-white text-opacity-90 text-lg">{config.description}</p>
        </div>

        {/* Main Input */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your Request
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={config.placeholder}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none h-24"
              ></textarea>
              <p className="text-sm text-gray-600 mt-2">
                💡 Tip: The more specific you are, the better the AI response
              </p>
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading || !input.trim() || credits <= 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Processing...' : `✨ Generate (${credits > 0 ? '1 credit' : 'No credits'})`}
            </button>

            {credits <= 0 && (
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
                <p className="font-semibold mb-2">Out of credits!</p>
                <p className="text-sm mb-3">Upgrade to Pro for unlimited access</p>
                <Link href="/dashboard/upgrade" className="inline-block px-4 py-2 bg-yellow-600 text-white rounded font-semibold hover:bg-yellow-700">
                  Upgrade Now
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Response */}
        {response && (
          <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">AI Response</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(response);
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
              >
                📋 Copy
              </button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-gray-800 leading-relaxed">
              {response}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Requests</h2>
            <div className="space-y-4">
              {history.slice(0, 3).map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  <p className="text-gray-800 font-semibold mb-2">Q: {item.input}</p>
                  <p className="text-gray-700 text-sm line-clamp-3">A: {item.response}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
