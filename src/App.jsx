import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { ShieldAlert, Database, Key, CheckCircle, ExternalLink } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    // 1. Check existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [configured])

  // Initial loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Initializing Insigra Portal...</p>
        </div>
      </div>
    )
  }

  // Helpful Setup Screen if environment variables are not configured yet
  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100">
        <div className="w-full max-w-xl bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Supabase Connection Required
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Please configure your Supabase Project credentials in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono text-xs">.env</code> to connect the Insigra Reports portal.
          </p>

          <div className="mt-6 space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-semibold text-slate-900">Create / Open Supabase Project</p>
                <p className="text-slate-500 mt-0.5">
                  Sign up for free at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 underline font-medium inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and create a new project.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-semibold text-slate-900">Execute Database Schema</p>
                <p className="text-slate-500 mt-0.5">
                  Run the SQL in <code className="bg-slate-200 px-1 rounded text-slate-800">supabase/schema.sql</code> in the Supabase SQL Editor.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-semibold text-slate-900">Set Environment Variables in .env</p>
                <p className="text-slate-500 mt-0.5">
                  Add <code className="font-mono text-slate-800">VITE_SUPABASE_URL</code> and <code className="font-mono text-slate-800">VITE_SUPABASE_ANON_KEY</code> (found under Project Settings &gt; API).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Authenticated vs Unauthenticated view
  return session ? (
    <Dashboard session={session} />
  ) : (
    <Login onLoginSuccess={(newSession) => setSession(newSession)} />
  )
}
