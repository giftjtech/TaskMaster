import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { authService } from '../services/auth.service';



const ResetPassword = () => {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [token, setToken] = useState<string | null>(null);



  useEffect(() => {

    const tokenParam = searchParams.get('token');

    if (!tokenParam) {

      setError('Invalid or missing reset token. Please request a new password reset link.');

    } else {

      setToken(tokenParam);

    }

  }, [searchParams]);



  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    setError('');



    // Validation

    if (!password || !confirmPassword) {

      setError('Please fill in all fields');

      return;

    }

    if (password.length < 8) {

      setError('Password must be at least 8 characters long');

      return;

    }

    if (password !== confirmPassword) {

      setError('Passwords do not match');

      return;

    }

    if (!token) {

      setError('Invalid reset token');

      return;

    }



    setLoading(true);

    try {

      await authService.resetPassword(token, password);

      setIsSuccess(true);

      setError('');

      // Redirect to login after 3 seconds

      setTimeout(() => {

        navigate('/login');

      }, 3000);

    } catch (err: any) {

      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to reset password. The link may have expired.';

      setError(errorMessage);

      setIsSuccess(false);

    } finally {

      setLoading(false);

    }

  };



  if (!token && !error) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">

        <div className="max-w-md w-full space-y-6 sm:space-y-8">

          <div className="text-center">

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>

          </div>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-6 sm:space-y-8">

        {/* Header */}

        <div className="text-center">

          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg transform hover:scale-105 transition duration-200">

            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />

            </svg>

          </div>

          {!isSuccess ? (

            <>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">

                Reset Your Password

              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Enter your new password below</p>

            </>

          ) : (

            <>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">

                Password Reset Successful!

              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Your password has been changed successfully</p>

            </>

          )}

        </div>



        {/* Form Card */}

        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">

          {!isSuccess ? (

            <form className="space-y-6" onSubmit={handleSubmit}>

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



              <div className="space-y-5">

                <div>

                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">

                    New Password

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

                      autoComplete="new-password"

                      required

                      minLength={8}

                      className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"

                      placeholder="Enter your new password"

                      value={password}

                      onChange={(e) => setPassword(e.target.value)}

                    />

                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">

                    Password must be at least 8 characters long

                  </p>

                </div>



                <div>

                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">

                    Confirm New Password

                  </label>

                  <div className="relative">

                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />

                      </svg>

                    </div>

                    <input

                      id="confirmPassword"

                      name="confirmPassword"

                      type="password"

                      autoComplete="new-password"

                      required

                      minLength={8}

                      className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"

                      placeholder="Confirm your new password"

                      value={confirmPassword}

                      onChange={(e) => setConfirmPassword(e.target.value)}

                    />

                  </div>

                </div>

              </div>



              <div>

                <button

                  type="submit"

                  disabled={loading}

                  className="group relative w-full flex justify-center py-2.5 sm:py-3 px-3 sm:px-4 border border-transparent text-sm sm:text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition duration-200 hover:scale-105 shadow-lg hover:shadow-xl"

                >

                  <span className="absolute left-0 inset-y-0 flex items-center pl-2 sm:pl-3">

                    {loading ? (

                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">

                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                      </svg>

                    ) : (

                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />

                      </svg>

                    )}

                  </span>

                  <span className="truncate">{loading ? 'Resetting Password...' : 'Reset Password'}</span>

                </button>

              </div>

            </form>

          ) : (

            <div className="text-center space-y-4 sm:space-y-6">

              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">

                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />

                </svg>

              </div>

              

              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 sm:p-4">

                <div className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium break-words">

                  Your password has been successfully reset. Redirecting to login...

                </div>

              </div>



              <button

                onClick={() => navigate('/login')}

                className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 transition duration-200"

              >

                Go to Login

              </button>

            </div>

          )}



          {/* Back to Login */}

          {!isSuccess && (

            <div className="mt-4 sm:mt-6 text-center">

              <button

                onClick={() => navigate('/login')}

                className="inline-flex items-center text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition duration-200"

              >

                <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />

                </svg>

                Back to login

              </button>

            </div>

          )}

        </div>



        {/* Footer */}

        <div className="text-center px-2">

          <p className="text-xs text-gray-500 dark:text-gray-400 break-words">

            Made with ❤️ for Outple

          </p>

        </div>

      </div>

    </div>

  );

};



export default ResetPassword;

