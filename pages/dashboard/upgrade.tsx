import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Upgrade() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData || '{}'));
    fetchCredits(token);
    loadRazorpayScript();
  }, []);

  const fetchCredits = async (token: string) => {
    try {
      const res = await fetch('/api/user/credits', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCredits(data);
    } catch (err) {
      console.error('Failed to fetch credits');
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleUpgrade = async (planType: 'pro_monthly' | 'pro_yearly') => {
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // Create order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType })
      });

      const order = await res.json();

      if (!window.Razorpay) {
        alert('Payment gateway not loaded. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        order_id: order.orderId,
        name: 'BizSaathi',
        description: planType === 'pro_monthly' ? 'Pro Monthly (₹299/month)' : 'Pro Yearly (₹2,999/year)',
        handler: function() {
          // Payment successful
          alert('Payment successful! Your account has been upgraded to Pro 🎉');
          router.push('/dashboard');
        },
        prefill: {
          email: user?.email || ''
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-70 transition">
              <span className="text-xl font-bold text-gray-800">← Back</span>
            </Link>
            <span className="text-gray-800 font-bold">Upgrade to Pro</span>
            <div></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Current Status */}
        {credits && credits.plan === 'pro' && (
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-8 mb-12 text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-2">✅ You're Already Pro!</h2>
            <p className="text-green-700">You have unlimited access to all BizSaathi tools</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Free Plan</h3>
            <p className="text-gray-600 mb-6">Your current plan</p>
            <div className="text-4xl font-bold text-gray-800 mb-6">₹0<span className="text-lg">/day</span></div>
            
            <ul className="space-y-3 mb-8">
              <li className="text-gray-700">✅ 10 AI credits daily</li>
              <li className="text-gray-700">✅ All 5 tools available</li>
              <li className="text-gray-400 line-through">❌ Priority support</li>
            </ul>
            
            <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-bold cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-8 shadow-lg border-4 border-yellow-400 transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-800 px-4 py-1 rounded-full font-bold text-sm">
              RECOMMENDED
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Pro Plan</h3>
            <p className="text-gray-600 mb-6">Unlimited everything</p>
            <div className="text-4xl font-bold text-gray-800 mb-6">₹299<span className="text-lg">/month</span></div>
            
            <ul className="space-y-3 mb-8">
              <li className="text-gray-800">✅ Unlimited AI credits</li>
              <li className="text-gray-800">✅ All 5 tools unlimited</li>
              <li className="text-gray-800">✅ Priority support</li>
              <li className="text-gray-800">✅ Usage analytics</li>
            </ul>
            
            <button
              onClick={() => handleUpgrade('pro_monthly')}
              disabled={loading || credits?.plan === 'pro'}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-500 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upgrade Now - ₹299/month'}
            </button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-center">
              <p className="text-sm text-blue-800">
                <strong>Limited Offer:</strong> First month at ₹99!
              </p>
            </div>
          </div>
        </div>

        {/* Yearly Option */}
        <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-green-500 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Pro Yearly Plan</h3>
              <p className="text-gray-600 mb-4">Save ₹2,585 per year</p>
              <div className="text-4xl font-bold text-gray-800 mb-2">₹2,999<span className="text-lg">/year</span></div>
              <p className="text-green-600 font-semibold">Just ₹249/month</p>
            </div>
            <button
              onClick={() => handleUpgrade('pro_yearly')}
              disabled={loading || credits?.plan === 'pro'}
              className="py-4 px-8 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 h-fit"
            >
              {loading ? 'Processing...' : 'Choose Yearly'}
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Feature Comparison</h3>
          
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-4 font-bold text-gray-800">Feature</th>
                <th className="text-center py-4 font-bold text-gray-800">Free</th>
                <th className="text-center py-4 font-bold text-gray-800">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Daily Credits</td>
                <td className="text-center text-gray-600">10</td>
                <td className="text-center text-green-600 font-bold">∞ Unlimited</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">WhatsApp Writer</td>
                <td className="text-center">✅</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Poster Maker</td>
                <td className="text-center">✅</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Profit Advisor</td>
                <td className="text-center">✅</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">GST Helper</td>
                <td className="text-center">✅</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Review Replier</td>
                <td className="text-center">✅</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-4 text-gray-700">Usage History</td>
                <td className="text-center">✅</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
              <tr>
                <td className="py-4 text-gray-700">Priority Support</td>
                <td className="text-center text-gray-400">❌</td>
                <td className="text-center text-green-600">✅</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-bold text-gray-800 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes! There are no long-term commitments. Cancel anytime from your dashboard.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-bold text-gray-800 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit/debit cards and UPI payments via Razorpay.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-bold text-gray-800 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">Yes! Free plan gives you 10 credits daily with no credit card required.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-bold text-gray-800 mb-2">Can I switch plans?</h4>
              <p className="text-gray-600">Absolutely. Upgrade or downgrade your plan anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
