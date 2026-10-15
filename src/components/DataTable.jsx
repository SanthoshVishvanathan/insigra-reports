import React, { useState } from 'react'
import { Search, ShieldCheck, TrendingUp, Layers } from 'lucide-react'

export default function DataTable({ data, companyName }) {
  const [searchTerm, setSearchTerm] = useState('')

  const totalLeads = data.reduce((acc, row) => acc + (Number(row.leads) || 0), 0)

  const filteredData = data.filter((row) =>
    row.channel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Header and Search */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Campaign Performance</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RLS Filtered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Displaying rows returned by Supabase for tenant: <strong className="text-slate-800">{companyName}</strong>
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-full sm:w-48 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-6">Channel</th>
              <th className="py-3 px-6 text-right">Leads</th>
              <th className="py-3 px-6">Contribution</th>
              <th className="py-3 px-6">Tenant Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                  No matching campaign records found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => {
                const percentage = totalLeads > 0 ? Math.round((row.leads / totalLeads) * 100) : 0
                return (
                  <tr key={row.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      {row.channel}
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-slate-900">
                      {row.leads.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-medium w-8">{percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {row.company_name}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {filteredData.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 font-semibold text-slate-900 border-t border-slate-200">
                <td className="py-3 px-6 text-xs uppercase tracking-wider text-slate-600">Total Leads</td>
                <td className="py-3 px-6 text-right text-base text-sky-700">{totalLeads.toLocaleString()}</td>
                <td className="py-3 px-6 text-xs text-slate-500" colSpan={2}>
                  100% tenant attributed
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
