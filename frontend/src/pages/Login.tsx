import { useState } from 'react';

import type { FormEvent } from 'react';

import { useLogin } from '../hooks/auth/useAuth';

import { useNavigate } from 'react-router-dom';

const Login = () => {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const loginMutation = useLogin();

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    setError('');

    setLoading(true);

    try {

      await loginMutation.mutateAsync({ email, password });

    } catch (err: any) {
      // Extract proper error message from backend response
      const errorMessage = 
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.message ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-6 sm:space-y-8">

        {/* Header */}

        <div className="text-center">

          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg transform hover:scale-105 transition duration-200">

            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />

            </svg>

          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">

            Welcome back

          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>

        </div>

        {/* Login Form */}

        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {error && (

              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">

                <div className="flex">

                  <svg className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">

                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

                  </svg>

                  <div className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</div>

                </div>

              </div>

            )}

            <div className="space-y-5">

              <div>

                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">

                  Email address

                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />

                    </svg>

                  </div>

                  <input

                    id="email"

                    name="email"

                    type="email"

                    autoComplete="email"

                    required

                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"

                    placeholder="Enter your email"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                  />

                </div>

              </div>

              <div>

                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">

                  Password

                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

                    </svg>

                  </div>

                  <input

                    id="password"

                    name="password"

                    type="password"

                    autoComplete="current-password"

                    required

                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"

                    placeholder="Enter your password"

                    value={password}

                    onChange={(e) => setPassword(e.target.value)}

                  />

                </div>

              </div>

            </div>

            <div className="flex justify-end">

              <button

                type="button"

                onClick={() => navigate('/forgot-password')}

                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition duration-200"

              >

                Forgot password?

              </button>

            </div>

            <div>

              <button

                type="submit"

                disabled={loading || loginMutation.isPending}

                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition duration-200 hover:scale-105 shadow-lg hover:shadow-xl"

              >

                <span className="absolute left-0 inset-y-0 flex items-center pl-3">

                  {loading || loginMutation.isPending ? (

                    <svg className="h-5 w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">

                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                    </svg>

                  ) : (

                    <svg className="h-5 w-5 text-white group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />

                    </svg>

                  )}

                </span>

                {loading || loginMutation.isPending ? 'Signing in...' : 'Sign in'}

              </button>

            </div>

          </form>

          {/* Footer */}

          {/* <div className="mt-6 text-center">

            <p className="text-sm text-gray-600">

              Don't have an account?{' '}

              <a

                href="/register"

                className="font-semibold text-indigo-600 hover:text-indigo-500 transition duration-200"

              >

                Sign up here

              </a>

            </p>

          </div> */}

        </div>

        {/* Additional decorative elements */}

        <div className="text-center">

          <p className="text-xs text-gray-500 dark:text-gray-400">

            Made with ❤️ for Outple

          </p>

        </div>

      </div>

    </div>

  );

};

export default Login;

