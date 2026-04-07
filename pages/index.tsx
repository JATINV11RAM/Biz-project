import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-opacity-10 backdrop-blur-md bg-white border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600">
                📱
              </div>
              <span className="text-white text-xl font-bold">BizSaathi</span>
            </div>
            
            <div className="hidden md:flex gap-6">
              <a href="#features" className="text-white hover:text-blue-100 transition">Features</a>
              <a href="#pricing" className="text-white hover:text-blue-100 transition">Pricing</a>
              <a href="#faq" className="text-white hover:text-blue-100 transition">FAQ</a>
            </div>

            <div className="flex gap-3">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.clear();
                      setIsLoggedIn(false);
                      router.push('/');
                    }}
                    className="px-4 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition">
                    Login
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your AI Business <br /> Assistant for India
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Professional WhatsApp messages, Social media posts, GST guidance, and more - powered by AI
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition transform hover:scale-105">
              {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            </Link>
            <a href="#features" className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:bg-opacity-10 transition">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20">
              <div className="text-4xl font-bold text-white mb-2">5</div>
              <div className="text-blue-100">AI Tools</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20">
              <div className="text-4xl font-bold text-white mb-2">∞</div>
              <div className="text-blue-100">Pro Features</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-lg border border-white border-opacity-20">
              <div className="text-4xl font-bold text-white mb-2">₹0</div>
              <div className="text-blue-100">Free Trial</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white bg-opacity-5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Powerful Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-3">WhatsApp Writer</h3>
              <p className="text-blue-100">Write professional WhatsApp messages to customers in seconds</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-white mb-3">Poster Maker</h3>
              <p className="text-blue-100">Create engaging social media posts for Instagram, Facebook & more</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-white mb-3">Profit Advisor</h3>
              <p className="text-blue-100">Get AI-powered business strategies to increase your profits</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">GST Helper</h3>
              <p className="text-blue-100">Tax compliance guidance specific to Indian small businesses</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-white mb-3">Review Replier</h3>
              <p className="text-blue-100">Professional responses to customer reviews and feedback</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Unlimited Pro</h3>
              <p className="text-blue-100">Upgrade to unlimited access to all tools starting at ₹9.99/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md p-8 rounded-lg border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <p className="text-blue-100 mb-6">Perfect to start</p>
              <div className="text-4xl font-bold text-white mb-6">₹0<span className="text-lg">/day</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="text-white">✅ 10 AI credits daily</li>
                <li className="text-white">✅ Use any tool</li>
                <li className="text-white">✅ Full access features</li>
                <li className="text-blue-100 line-through">❌ Priority support</li>
              </ul>
              
              <button className="w-full py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition">
                {isLoggedIn ? "Already Free" : "Sign Up Free"}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-8 rounded-lg border-2 border-yellow-300 transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-800 px-4 py-1 rounded-full font-bold text-sm">
                MOST POPULAR
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Pro</h3>
              <p className="text-gray-700 mb-6">Unlimited everything</p>
              <div className="text-4xl font-bold text-gray-800 mb-6">₹299<span className="text-lg">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="text-gray-800">✅ Unlimited AI credits</li>
                <li className="text-gray-800">✅ All 5 tools unlimited</li>
                <li className="text-gray-800">✅ Priority support</li>
                <li className="text-gray-800">✅ Usage analytics</li>
              </ul>
              
              <Link href={isLoggedIn ? "/dashboard/upgrade" : "/signup"} className="w-full block text-center py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white bg-opacity-5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            10 free credits every day. No credit card required.
          </p>
          
          <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition transform hover:scale-105">
            {isLoggedIn ? "Go to Dashboard" : "Start Free Now"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white border-opacity-20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600">
                  📱
                </div>
                <span className="text-white font-bold">BizSaathi</span>
              </div>
              <p className="text-blue-100 text-sm">AI assistant for Indian small business owners</p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-100 hover:text-white transition">Features</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-100 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-100 hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="text-blue-100 hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white border-opacity-20 pt-8 text-center text-blue-100">
            <p>&copy; 2026 BizSaathi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
