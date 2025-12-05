import { useState } from 'react';

import type { MouseEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import { authService } from '../services/auth.service';



const ForgotPassword = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [message, setMessage] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);



  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {

    e.preventDefault();

    setError('');

    setMessage('');

    setLoading(true);



    // Validate email format

    if (!email || !email.includes('@')) {

      setError('Please enter a valid email address');

      setLoading(false);

      return;

    }



    try {

      await authService.forgotPassword(email);

      setMessage('Password reset link has been sent to your email address.');

      setIsSubmitted(true);

      setError('');

    } catch (err: any) {

      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to send reset email. Please try again.';

      setError(errorMessage);

      setIsSubmitted(false);

    } finally {

      setLoading(false);

    }

  };



  const handleBackToLogin = () => {

    navigate('/login');

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-6 sm:space-y-8">

        {/* Header */}

        <div className="text-center">

          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg transform hover:scale-105 transition duration-200">

            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

            </svg>

          </div>

          {!isSubmitted ? (

            <>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">

                Forgot Password?

              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Don't worry, we'll send you reset instructions</p>

            </>

          ) : (

            <>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">

                Check Your Email

              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">We've sent password reset instructions to your email</p>

            </>

          )}

        </div>



        {/* Form Card */}

        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">

          {!isSubmitted ? (

            <div className="space-y-6">

              {error && (

                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4">

                  <div className="flex items-start">

                    <svg className="h-5 w-5 text-red-400 dark:text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">

                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />

                    </svg>

                    <div className="text-xs sm:text-sm text-red-700 dark:text-red-400 font-medium break-words">{error}</div>

                  </div>

                </div>

              )}



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

                    className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"

                    placeholder="Enter your email address"

                    value={email}

                    onChange={(e) => setEmail(e.target.value)}

                  />

                </div>

                <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">

                  Enter the email address associated with your account

                </p>

              </div>



              <div>

                <button

                  onClick={handleSubmit}

                  disabled={loading}

                  className="group relative w-full flex justify-center py-2.5 sm:py-3 px-3 sm:px-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition duration-200 hover:scale-105 shadow-lg hover:shadow-xl"

                >

                  <span className="absolute left-0 inset-y-0 flex items-center pl-2 sm:pl-3">

                    {loading ? (

                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">

                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                      </svg>

                    ) : (

                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />

                      </svg>

                    )}

                  </span>

                  <span className="truncate">{loading ? 'Sending...' : 'Send Reset Link'}</span>

                </button>

              </div>

            </div>

          ) : (

            <div className="text-center space-y-4 sm:space-y-6">

              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">

                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />

                </svg>

              </div>

              

              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4">

                <div className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium break-words">{message}</div>

              </div>



              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">

                <p>If you don't see the email, check your spam folder.</p>

                <p>The link will expire in 24 hours for security reasons.</p>

              </div>



              <button

                onClick={() => {

                  setIsSubmitted(false);

                  setEmail('');

                  setMessage('');

                }}

                className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 font-semibold transition duration-200 px-2 py-1"

              >

                Try another email address

              </button>

            </div>

          )}



          {/* Back to Login */}

          <div className="mt-4 sm:mt-6 text-center">

            <button

              onClick={handleBackToLogin}

              className="inline-flex items-center text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition duration-200"

            >

              <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />

              </svg>

              Back to login

            </button>

          </div>

        </div>



        {/* Security Notice */}

        <div className="text-center px-2">

          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">

            For security, reset links expire after 24 hours

          </p>

        </div>

      </div>

    </div>

  );

};



export default ForgotPassword;

