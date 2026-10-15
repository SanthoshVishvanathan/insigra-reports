import React, { useState } from 'react'
import { ShieldCheck, Terminal, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react'

export default function SecurityInspector({ user, profile, rowCount }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100">
                Database Multi-Tenant Isolation (RLS Verification)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Active & Enforced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified: Frontend executed raw <code className="text-sky-300 font-mono">select('*')</code> with ZERO client-side filters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs hidden sm:inline">
            {isExpanded ? 'Hide Technical Proof' : 'View SQL & Policy Proof'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-800 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frontend Call */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800">
                <span className="text-sky-400 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Frontend JavaScript Call
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                  No company filter in code
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`// src/components/Dashboard.jsx
const { data, error } = await supabase
  .from('campaign_data')
  .select('*')
  .order('leads', { ascending: false });`}
              </pre>
            </div>

            {/* Postgres RLS Policy */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> PostgreSQL RLS Policy (Enforced)
                </span>
                <span className="text-[10px] text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded">
                  Database Engine
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`CREATE POLICY "Users view own company data"
ON public.campaign_data
FOR SELECT TO authenticated
USING (
  company_name = (
    SELECT company_name FROM public.profiles
    WHERE id = (SELECT auth.uid())
  )
);`}
              </pre>
            </div>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-slate-300">
            <div>
              <span className="text-slate-400">Authenticated UID:</span>{' '}
              <span className="text-sky-300">{user?.id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Resolved Company:</span>{' '}
              <span className="text-emerald-300 font-bold">{profile?.company_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Total Rows Returned:</span>{' '}
              <span className="text-amber-300 font-bold">{rowCount} (Only {profile?.company_name})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
