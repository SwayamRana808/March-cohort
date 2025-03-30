'use client';

import { createClient } from '@/utils/supabase/client'
import { Eye, EyeOff, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e, action) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const data = {
        email: formData.get('email'),
        password: formData.get('password'),
      };

      if (action === 'login') {
        const { error } = await supabase.auth.signInWithPassword(data);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp(data);
        if (error) throw error;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <form onSubmit={(e) => handleSubmit(e, 'login')} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <div className="flex flex-col items-center">
          <MessageSquare className="h-12 w-12 text-blue-600 mb-2" />
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
            <div className="relative">
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Loading...' : 'Log in'}
          </button>
          <button 
            type="button"
            onClick={(e) => handleSubmit(e, 'signup')}
            disabled={loading}
            className={`w-full py-2 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Loading...' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  )
} 