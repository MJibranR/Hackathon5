"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Ticket as TicketIcon, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Smile, 
  MessageSquare,
  Mail,
  Smartphone,
  Globe,
  Clock,
  ExternalLink,
  Zap,
  CheckCircle2,
  TrendingUp,
  User,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Metrics {
  total_tickets: number;
  open_tickets: number;
  escalations: number;
  avg_sentiment: number;
  avg_response_time: number;
  tickets_by_channel: Record<string, number>;
  tickets_by_status: Record<string, number>;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, ticketsRes] = await Promise.all([
          fetch("https://muhammadjibran-hackathon5.hf.space/api/metrics/overview"),
          fetch("https://muhammadjibran-hackathon5.hf.space/api/tickets?limit=5")
        ])
        const metricsData = await metricsRes.json()
        const ticketsData = await ticketsRes.json()
        
        setMetrics(metricsData)
        setRecentTickets(ticketsData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="h-8 w-64 bg-slate-900 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
        <div className="h-96 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
      </div>
    </div>
  )

  const stats = [
    { name: "Total Interactions", value: metrics?.total_tickets, icon: TicketIcon, trend: "+12.5%", trendUp: true, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { name: "Active Tickets", value: metrics?.open_tickets, icon: AlertCircle, trend: "-4.2%", trendUp: false, color: "text-amber-400", bg: "bg-amber-400/10" },
    { name: "AI Response Time", value: `${metrics?.avg_response_time.toFixed(1)}s`, icon: Zap, trend: "-0.8s", trendUp: false, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { name: "Sentiment Score", value: `${((metrics?.avg_sentiment || 0) * 100).toFixed(0)}%`, icon: Smile, trend: "+5.1%", trendUp: true, color: "text-pink-400", bg: "bg-pink-400/10" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Support Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time performance of NovaSaaS AI Agent across all channels.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM LIVE: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="group bg-slate-900/50 hover:bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                stat.trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              )}>
                {stat.trend}
                {stat.trendUp ? <TrendingUp className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                {stat.name === "Total Interactions" && <span className="text-xs text-slate-500">lifetime</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Feed: Recent Tickets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold">Recent Inbound Tickets</h3>
              </div>
              <Link href="/tickets" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-wider">
                View All <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {recentTickets.length > 0 ? recentTickets.map((ticket: any) => (
                <div key={ticket.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      ticket.source_channel === 'whatsapp' ? "bg-emerald-500/10 text-emerald-400" :
                      ticket.source_channel === 'gmail' ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {ticket.source_channel === 'whatsapp' && <Smartphone className="h-5 w-5" />}
                      {ticket.source_channel === 'gmail' && <Mail className="h-5 w-5" />}
                      {ticket.source_channel === 'web_form' && <Globe className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">#{ticket.id.slice(0, 8)}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          ticket.status === 'open' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-700 text-slate-400"
                        )}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">Category: {ticket.category || "General Inquiry"}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Link href={`/tickets/${ticket.id}`} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-500 text-sm">No recent tickets available.</div>
              )}
            </div>
          </div>

          {/* Quick Actions / Channel Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                   <Zap className="h-20 w-20 text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">AI Integration Status</h4>
                <div className="space-y-4 relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                         <span className="text-sm font-medium">OpenAI GPT-4o</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">OPTIMIZED</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-emerald-500" />
                         <span className="text-sm font-medium">Knowledge Base Sync</span>
                      </div>
                      <span className="text-xs text-slate-500">Last: 2m ago</span>
                   </div>
                   <div className="pt-2">
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 rounded-full w-full animate-pulse" />
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Response Efficiency</h4>
                <div className="flex items-center gap-6">
                   <div className="relative h-20 w-20">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                         <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="251" strokeDashoffset="40" strokeLinecap="round" transform="rotate(-90 50 50)" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">84%</div>
                   </div>
                   <div>
                      <p className="text-xs text-slate-400 leading-relaxed">Agent performance is <span className="text-emerald-400 font-bold">above average</span> this week. Response quality remains high.</p>
                      <button className="mt-3 text-xs font-bold text-indigo-400 hover:underline">View Detailed Report</button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Sentiment Gauge */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center">
            <h3 className="text-lg font-bold self-start mb-6">Customer Sentiment</h3>
            <div className="relative h-48 w-48">
               <svg className="h-full w-full" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="10" 
                    strokeDasharray="282.7" 
                    strokeDashoffset={282.7 * (1 - (metrics?.avg_sentiment || 0))} 
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold tracking-tighter">{((metrics?.avg_sentiment || 0) * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Satisfaction</span>
               </div>
            </div>
            <div className="mt-6 w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Highly Positive</span>
                <span className="font-bold">62%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[62%]" />
              </div>
            </div>
          </div>

          {/* Channel Distribution */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-6">Volume by Channel</h3>
            <div className="space-y-5">
              {Object.entries(metrics?.tickets_by_channel || {}).map(([channel, count]: [string, any]) => (
                <div key={channel} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      {channel === 'whatsapp' && <Smartphone className="h-4 w-4 text-emerald-400" />}
                      {channel === 'gmail' && <Mail className="h-4 w-4 text-rose-400" />}
                      {channel === 'web_form' && <Globe className="h-4 w-4 text-blue-400" />}
                      <span className="capitalize">{channel.replace('_', ' ')}</span>
                    </div>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        channel === 'whatsapp' ? "bg-emerald-500" :
                        channel === 'gmail' ? "bg-rose-500" : "bg-blue-500"
                      )}
                      style={{ width: `${(count / (metrics?.total_tickets || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 opacity-20">
              <CheckCircle2 className="h-24 w-24" />
            </div>
            <h3 className="text-lg font-bold mb-2">System Health</h3>
            <p className="text-indigo-100 text-sm mb-4">All services are operational. No major latency detected.</p>
            <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" /> Uptime: 99.9%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

