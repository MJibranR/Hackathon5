"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Send, 
  ShieldAlert, 
  CheckCircle2,
  User,
  Bot,
  Mail,
  Smartphone,
  Globe,
  Clock,
  MessageCircle,
  Hash,
  Activity,
  Calendar,
  Zap,
  Tag,
  ShieldCheck,
  MoreVertical,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState("")

  const fetchTicket = () => {
    fetch(`https://muhammadjibran-hackathon5.hf.space/api/tickets/${id}`)
      .then(res => res.json())
      .then(data => {
        setTicket(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching ticket:", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  const handleEscalate = async () => {
    setActionLoading(true)
    try {
      await fetch(`https://muhammadjibran-hackathon5.hf.space/api/tickets/${id}/escalate`, { method: 'POST' })
      fetchTicket()
    } catch (err) {
      console.error("Failed to escalate:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolve = async () => {
    setActionLoading(true)
    try {
      await fetch(`https://muhammadjibran-hackathon5.hf.space/api/tickets/${id}/resolve`, { method: 'POST' })
      fetchTicket()
    } catch (err) {
      console.error("Failed to resolve:", err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-32 bg-slate-900 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[600px] bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-[400px] bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    </div>
  )

  if (!ticket) return (
    <div className="text-center py-20">
      <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold">Ticket Not Found</h2>
      <p className="text-slate-500 mt-2">The ticket you are looking for does not exist or has been archived.</p>
      <Link href="/tickets" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Back to Tickets</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link href="/tickets" className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:bg-slate-800 group-hover:border-slate-700">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider">Back to List</span>
        </Link>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <div className={cn(
                "h-2 w-2 rounded-full",
                ticket.status === 'open' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{ticket.status}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm h-[750px]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                 <User className="h-6 w-6 text-indigo-400" />
               </div>
               <div>
                 <h3 className="font-bold text-slate-100 flex items-center gap-2">
                   Customer Interaction 
                   <span className="text-xs text-slate-500 font-normal">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                 </h3>
                 <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold uppercase tracking-widest">
                      <Hash className="h-3 w-3" /> {ticket.category || "General"}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-bold uppercase tracking-widest">
                      <Activity className="h-3 w-3" /> {ticket.source_channel.replace('_', ' ')}
                    </span>
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEscalate}
                disabled={actionLoading || ticket.status === 'escalated'}
                className="hidden md:flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all border border-rose-500/20 disabled:opacity-50"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {ticket.status === 'escalated' ? 'Escalated' : 'Escalate'}
              </button>
              <button 
                onClick={handleResolve}
                disabled={actionLoading || ticket.status === 'resolved'}
                className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {ticket.status === 'resolved' ? 'Resolved' : 'Resolve'}
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent_40%)]">
            {ticket.messages?.length > 0 ? ticket.messages.map((msg: any) => (
              <div key={msg.id} className={cn(
                "flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500",
                msg.role === 'assistant' ? "ml-auto flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-110",
                  msg.role === 'assistant' ? "bg-indigo-600 text-white order-2" : "bg-slate-800 text-slate-400"
                )}>
                  {msg.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "space-y-1.5",
                  msg.role === 'assistant' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'assistant' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50"
                  )}>
                    {msg.content}
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1",
                    msg.role === 'assistant' ? "flex-row-reverse" : ""
                  )}>
                    <Clock className="h-3 w-3" />
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span className="opacity-30">•</span>
                    {msg.role === 'assistant' ? 'AI Agent' : 'Customer'}
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                 <div className="p-4 bg-slate-800/50 rounded-full">
                    <MessageCircle className="h-10 w-10 opacity-20" />
                 </div>
                 <p className="text-sm font-medium italic">No message history found for this ticket.</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-slate-900/80 border-t border-slate-800 backdrop-blur-xl">
            <div className="relative group">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose a response..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group-hover:scale-105">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
               <p className="text-[10px] text-slate-600 font-medium">Press <span className="text-slate-400 font-bold">Enter</span> to send message</p>
               <div className="flex gap-4">
                  <button className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">Internal Note</button>
                  <button className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">Knowledge Base</button>
               </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <ShieldCheck className="h-24 w-24 text-indigo-400" />
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity className="h-3 w-3 text-indigo-400" /> Metadata
            </h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Priority Level</span>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                  ticket.priority === 'high' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-slate-800 text-slate-400 border border-slate-700"
                )}>{ticket.priority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Channel</span>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
                    {ticket.source_channel === 'whatsapp' && <Smartphone className="h-3.5 w-3.5" />}
                    {ticket.source_channel === 'gmail' && <Mail className="h-3.5 w-3.5" />}
                    {ticket.source_channel === 'web_form' && <Globe className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-xs font-bold text-slate-200 capitalize">{ticket.source_channel.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Category</span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-indigo-400" />
                  {ticket.category || "General"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Timeline</h4>
             <div className="space-y-6">
                <div className="flex gap-4 relative">
                   <div className="absolute left-[7px] top-4 bottom-[-24px] w-[2px] bg-slate-800/50" />
                   <div className="h-4 w-4 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex-shrink-0 z-10" />
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-200">Ticket Created</p>
                     <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-1" />
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="h-4 w-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex-shrink-0 z-10" />
                   <div className="space-y-1">
                     <p className="text-xs font-bold text-slate-200">AI Agent Assigned</p>
                     <p className="text-[10px] text-slate-500 font-medium italic">Instant response triggered</p>
                   </div>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                   <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-3 w-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Status</span>
                   </div>
                   <p className="text-xs text-slate-400 leading-relaxed font-medium">The AI is currently monitoring this conversation for sentiment shifts.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
