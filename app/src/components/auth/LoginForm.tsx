'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';

export default function LoginForm() {
  const { login, register } = useApp();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(true);

    if (isLogin) {
      const result = await login(username || email, password);
      if (!result.success) {
        setErrors({
          username: result.fieldErrors?.identifier ?? result.fieldErrors?.username,
          email: result.fieldErrors?.email,
          password: result.fieldErrors?.password,
          general: result.message,
        });
        setIsSubmitting(false);
      } else {
        // Redirect to dashboard after successful login
        router.push('/dashboard');
      }
    } else {
      const result = await register(username, email, password);
      if (!result.success) {
        setErrors({
          username: result.fieldErrors?.username,
          email: result.fieldErrors?.email,
          password: result.fieldErrors?.password,
          general: result.message,
        });
      } else {
        setSuccessMessage(result.message ?? 'Account created. Please sign in.');
        setIsLogin(true);
        setUsername('');
        setEmail('');
        setPassword('');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Task Manager
        </h1>
        <p className="text-gray-600 text-center mb-3">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>
        {successMessage && (
          <p className="text-sm text-green-600 text-center mb-3">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isLogin ? 'Username or Email' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-gray-400"
              placeholder={isLogin ? 'Enter username or email' : 'Enter username'}
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">{errors.username}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-gray-400"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-gray-400"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed active:bg-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setUsername('');
              setEmail('');
              setPassword('');
              setSuccessMessage('');
            }}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors duration-200"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

