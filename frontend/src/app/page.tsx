"use client"

import { useEffect, useState } from "react"
import { 
  Ticket as TicketIcon, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Smile, 
  MessageSquare,
  Mail,
  Smartphone,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Metrics {
  total_tickets: number;
  open_tickets: number;
  escalations: number;
  avg_sentiment: number;
  tickets_by_channel: Record<string, number>;
  tickets_by_status: Record<string, number>;
}

export default function Dashboard() {
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
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-900 rounded-xl" />)}
    </div>
  </div>

  const stats = [
    { name: "Total Tickets", value: metrics?.total_tickets, icon: TicketIcon, trend: "+12%", trendUp: true },
    { name: "Open Tickets", value: metrics?.open_tickets, icon: AlertCircle, trend: "-5%", trendUp: false },
    { name: "Response Time", value: `${metrics?.avg_response_time.toFixed(1)}s`, icon: MessageSquare, trend: "-0.4s", trendUp: false },
    { name: "Avg Sentiment", value: `${(metrics?.avg_sentiment * 100).toFixed(0)}%`, icon: Smile, trend: "+8%", trendUp: true },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Support Overview</h1>
        <p className="text-slate-400">Real-time performance of the NovaSaaS AI Agent.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-slate-800 rounded-lg">
                <stat.icon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className={cn(
                "flex items-center text-sm font-medium",
                stat.trendUp ? "text-emerald-400" : "text-rose-400"
              )}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="ml-1 h-4 w-4" /> : <ArrowDownRight className="ml-1 h-4 w-4" />}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-400">{stat.name}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Channel Distribution */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6">Tickets by Channel</h3>
          <div className="space-y-4">
            {Object.entries(metrics?.tickets_by_channel || {}).map(([channel, count]: [string, any]) => (
              <div key={channel} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {channel === 'whatsapp' && <Smartphone className="h-4 w-4 text-emerald-400" />}
                    {channel === 'gmail' && <Mail className="h-4 w-4 text-rose-400" />}
                    {channel === 'web_form' && <Globe className="h-4 w-4 text-blue-400" />}
                    <span className="capitalize">{channel.replace('_', ' ')}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${(count / metrics.total_tickets) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Gauge */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6 self-start">Customer Sentiment</h3>
          <div className="relative h-48 w-48">
             <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={metrics.avg_sentiment > 0.7 ? "#10b981" : metrics.avg_sentiment > 0.4 ? "#6366f1" : "#f43f5e"} strokeWidth="10" 
                  strokeDasharray="282.7" 
                  strokeDashoffset={282.7 * (1 - metrics.avg_sentiment)} 
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{(metrics.avg_sentiment * 100).toFixed(0)}%</span>
                <span className="text-sm text-slate-400 uppercase tracking-wider">Positive</span>
             </div>
          </div>
        </div>

        {/* Escalations & Health */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6">System Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Escalations</span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-bold",
                metrics.escalations > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {metrics.escalations} Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">API Status</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">AI Latency</span>
              <span className="text-sm font-medium text-emerald-400">Low</span>
            </div>
            <div className="pt-4 border-t border-slate-800">
               <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Knowledge Base Sync</span>
                  <span>100%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Connectivity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Channel Connectivity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Globe className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Web Portal</p>
              <p className="text-xs text-emerald-400">Active & Ready</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Smartphone className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">WhatsApp Sandbox</p>
              <p className="text-xs text-slate-400">+1 415 523 8886</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-3 bg-rose-500/10 rounded-lg">
              <Mail className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Gmail Integration</p>
              <p className="text-xs text-slate-400">support@novasaas.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

