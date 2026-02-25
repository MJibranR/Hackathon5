"use client"

import { useEffect, useState } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Activity
} from "lucide-react"

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:8000/api/metrics/overview")
      .then(res => res.json())
      .then(data => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(err => console.error("Error fetching metrics:", err))
  }, [])

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-32 bg-slate-900 rounded-xl" />
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-900 rounded-xl" />)}
    </div>
  </div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-slate-400">Deep dive into AI performance and support trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-400" />
             </div>
             <h3 className="font-semibold">Response Efficiency</h3>
          </div>
          <div className="text-3xl font-bold mb-2">{metrics.avg_response_time.toFixed(1)}s</div>
          <p className="text-sm text-slate-400">Average time for AI to generate and send a response across all channels.</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-emerald-400" />
             </div>
             <h3 className="font-semibold">Automation Rate</h3>
          </div>
          <div className="text-3xl font-bold mb-2">
            {(((metrics.total_tickets - metrics.escalations) / metrics.total_tickets) * 100).toFixed(0)}%
          </div>
          <p className="text-sm text-slate-400">Percentage of tickets successfully resolved by AI without human escalation.</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-rose-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-rose-400" />
             </div>
             <h3 className="font-semibold">Resolution Health</h3>
          </div>
          <div className="text-3xl font-bold mb-2">
            {(metrics.avg_sentiment * 100).toFixed(0)}%
          </div>
          <p className="text-sm text-slate-400">Overall customer satisfaction score derived from real-time sentiment analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
           <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
             <TrendingUp className="h-5 w-5 text-indigo-400" />
             Ticket Volume by Channel
           </h3>
           <div className="h-64 flex items-end justify-around gap-4">
              {Object.entries(metrics.tickets_by_channel).map(([channel, count]: [string, any]) => (
                <div key={channel} className="flex flex-col items-center gap-2 w-full">
                   <div 
                    className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t-lg relative group"
                    style={{ height: `${(count / metrics.total_tickets) * 100}%` }}
                   >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </div>
                   </div>
                   <span className="text-xs text-slate-500 capitalize">{channel.replace('_', ' ')}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
           <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
             <PieIcon className="h-5 w-5 text-indigo-400" />
             Resolution Status
           </h3>
           <div className="space-y-6 mt-4">
              {Object.entries(metrics.tickets_by_status).map(([status, count]: [string, any]) => (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-slate-400">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        status === 'open' ? 'bg-indigo-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${(count / metrics.total_tickets) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
