'use client';

import { apiErrorMessage, apiFieldErrors, AuthApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFieldErrors({ email: 'Email is required.' });
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const result = await AuthApi.forgotPassword({ email: trimmedEmail });
      if (!result.ok) {
        const serverFieldErrors = apiFieldErrors(result.body);
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        }
        setError(
          apiErrorMessage(result.body, 'Could not send reset code. Please try again.')
        );
        return;
      }

      setSuccess(
        apiErrorMessage(
          result.body,
          'If the email exists, a reset code has been sent. Check your inbox and return here with the new code.'
        )
      );
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#f6f8f6' }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900 mb-1">Request a new code</h1>
          <p className="text-sm text-slate-500 mb-6">
            Enter your email and we&apos;ll send a new 6-digit code if an account exists.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
              {fieldErrors.email && (
                <p className="text-xs font-medium text-red-600 mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            {success && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                <p className="text-sm font-medium text-emerald-700">{success}</p>
                <p className="text-sm mt-2">
                  <Link
                    href={`/set-password?email=${encodeURIComponent(email.trim())}`}
                    className="font-bold hover:underline"
                    style={{ color: '#112116' }}
                  >
                    Enter your new code
                  </Link>
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#112116' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending…
                </>
              ) : (
                'Send reset code'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Have your code?{' '}
            <Link href="/set-password" className="font-bold hover:underline" style={{ color: '#112116' }}>
              Set your password
            </Link>
          </p>
          <p className="text-center text-sm text-slate-500 mt-2">
            <Link href="/auth/login" className="font-bold hover:underline" style={{ color: '#112116' }}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}
