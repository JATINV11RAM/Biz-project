import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface Credits {
  credits_remaining: number;
  plan: string;
  daily_limit: number;
  next_reset: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData || '{}'));
    fetchCredits(token);
  }, []);

  const fetchCredits = async (token: string) => {
    try {
      const res = await fetch('/api/user/credits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCredits(data);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const tools = [
    {
      id: 'whatsapp-writer',
      name: '💬 WhatsApp Writer',
      description: 'Professional WhatsApp messages',
      bg: 'from-green-400 to-green-600'
    },
    {
      id: 'poster-maker',
      name: '📱 Poster Maker',
      description: 'Social media captions',
      bg: 'from-pink-400 to-pink-600'
    },
    {
      id: 'profit-advisor',
      name: '📈 Profit Advisor',
      description: 'Business strategies',
      bg: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'gst-helper',
      name: '📊 GST Helper',
      description: 'Tax compliance guidance',
      bg: 'from-purple-400 to-purple-600'
    },
    {
      id: 'review-replier',
      name: '⭐ Review Replier',
      description: 'Customer review responses',
      bg: 'from-red-400 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                📱
              </div>
              <span className="text-xl font-bold text-gray-800">BizSaathi</span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/dashboard/upgrade" className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg font-semibold hover:bg-yellow-500 transition">
                ⭐ Upgrade Pro
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">Choose an AI tool to get started</p>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-2">CREDITS TODAY</p>
              <p className="text-5xl font-bold">{credits?.credits_remaining || 0}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-2">DAILY LIMIT</p>
              <p className="text-5xl font-bold">{credits?.daily_limit || 10}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-2">PLAN</p>
              <p className="text-3xl font-bold capitalize">{credits?.plan === 'free' ? '🆓 Free' : '⭐ Pro'}</p>
              {credits?.plan === 'free' && (
                <Link href="/dashboard/upgrade" className="text-blue-100 hover:text-white underline text-sm mt-2 block">
                  Upgrade to unlimited →
                </Link>
              )}
            </div>
          </div>

          {credits?.plan === 'free' && (
            <div className="mt-6 pt-6 border-t border-blue-400 border-opacity-50">
              <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all"
                  style={{width: `${((credits?.daily_limit - credits?.credits_remaining) / credits?.daily_limit) * 100}%`}}
                ></div>
              </div>
              <p className="text-blue-100 text-sm mt-2">
                {credits?.credits_remaining} credits left today (resets {new Date(credits?.next_reset || '').toLocaleTimeString()})
              </p>
            </div>
          )}
        </div>

        {/* Tools Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className={`bg-gradient-to-br ${tool.bg} rounded-lg p-8 text-white hover:shadow-lg hover:scale-105 transition transform cursor-pointer`}
            >
              <h3 className="text-2xl font-bold mb-2">{tool.name}</h3>
              <p className="text-white text-opacity-90 mb-4">{tool.description}</p>
              <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-semibold">
                Use Tool →
              </div>
            </Link>
          ))}
        </div>

        {/* See History */}
        <div className="mt-12">
          <Link href="/dashboard/history" className="text-blue-600 font-semibold hover:underline">
            View your usage history →
          </Link>
        </div>
      </div>
    </div>
  );
}
