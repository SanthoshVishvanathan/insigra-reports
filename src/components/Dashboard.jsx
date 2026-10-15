import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import LeadChart from './LeadChart'
import DataTable from './DataTable'
import SecurityInspector from './SecurityInspector'
import {
  Building2,
  LogOut,
  TrendingUp,
  Award,
  Layers,
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null)
  const [campaignData, setCampaignData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const user = session?.user

  // Fetch tenant profile and campaign data
  const fetchData = async () => {
    try {
      setErrorMsg('')

      // 1. Fetch user's own profile (governed by profiles RLS)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('Profile fetch note:', profileError.message)
      }
      setProfile(profileData || { company_name: 'Unknown Company' })

      // 2. Fetch campaign data (governed strictly by campaign_data RLS policy!)
      // CRITICAL: We issue a generic select('*') with NO company filter in JavaScript.
      // The PostgreSQL database RLS engine filters rows so Company A never sees Company B.
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaign_data')
        .select('*')
        .order('leads', { ascending: false })

      if (campaignError) {
        throw campaignError
      }

      setCampaignData(campaigns || [])
    } catch (err) {
      setErrorMsg(err.message || 'Error querying database.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user?.id])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  // Summary Metrics calculations
  const totalLeads = campaignData.reduce((acc, row) => acc + (Number(row.leads) || 0), 0)
  const topChannel = campaignData.length > 0 ? campaignData[0] : null
  const companyName = profile?.company_name || 'Loading Company...'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">
            Connecting to Insigra Reports database...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  Insigra Reports
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  Analytics Portal
                </span>
              </div>
            </div>
          </div>

          {/* User & Tenant Session Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800">
                  {companyName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {user?.email}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              title="Refresh Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 bg-slate-100/80 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Tenant Banner / Greeting */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-medium backdrop-blur-sm mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tenant Scope: <span className="font-bold text-white">{companyName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Marketing Performance Overview
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time multi-channel lead generation metrics. Row Level Security ensures data confidentiality across all enterprise tenants.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Database Tenant</div>
              <div className="text-lg font-bold text-white">{companyName}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base border border-sky-400/20">
              {companyName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Database Query Warning</p>
              <p className="text-xs mt-0.5 text-amber-800">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* KPI Metrics Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Leads
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {totalLeads.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Top Channel
              </p>
              <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">
                {topChannel ? topChannel.channel : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400">
                {topChannel ? `${topChannel.leads} leads` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Channels
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {campaignData.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Data Isolation
              </p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                Postgres RLS
              </p>
              <p className="text-[11px] text-slate-400">
                Zero leak guaranteed
              </p>
            </div>
          </div>
        </div>

        {/* Visual Analytics & Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart (Leads by Channel) */}
          <div className="lg:col-span-6">
            <LeadChart data={campaignData} companyName={companyName} />
          </div>

          {/* Table (Campaign Data) */}
          <div className="lg:col-span-6">
            <DataTable data={campaignData} companyName={companyName} />
          </div>
        </div>

        {/* Technical Security Inspector (RLS Demonstration) */}
        <div className="pt-2">
          <SecurityInspector
            user={user}
            profile={profile}
            rowCount={campaignData.length}
          />
        </div>
      </main>
    </div>
  )
}
