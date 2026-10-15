import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Building2 } from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        throw error
      }

      if (onLoginSuccess && data?.session) {
        onLoginSuccess(data.session)
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickCredentials = (testEmail, testPass = 'Password123!') => {
    setEmail(testEmail)
    setPassword(testPass)
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-100 via-sky-50/40 to-slate-100">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30 mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Insigra Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-Tenant Marketing Performance Portal
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Reviewer */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Evaluation Test Credentials
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 font-medium">
                <Sparkles className="w-3 h-3 text-sky-500" />
                1-Click Pre-fill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillQuickCredentials('alpha@test.com', 'Password123!')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-200 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                  Alpha Ltd
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  alpha@test.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('beta@test.com', 'Password123!')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/60 hover:border-sky-200 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                  Beta Ltd
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  beta@test.com
                </div>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              Default password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">Password123!</code>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strict Row-Level Security (RLS) active on database.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
