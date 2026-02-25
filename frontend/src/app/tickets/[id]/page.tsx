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
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchTicket = () => {
    fetch(`http://localhost:8000/api/tickets/${id}`)
      .then(res => res.json())
      .then(data => {
        setTicket(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTicket()
  }, [id])

  const handleEscalate = async () => {
    setActionLoading(true)
    try {
      await fetch(`http://localhost:8000/api/tickets/${id}/escalate`, { method: 'POST' })
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
      await fetch(`http://localhost:8000/api/tickets/${id}/resolve`, { method: 'POST' })
      fetchTicket()
    } catch (err) {
      console.error("Failed to resolve:", err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="animate-pulse p-8 bg-slate-900 rounded-xl h-96"></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/tickets" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chat Area */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[700px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-800 rounded-full">
                 <User className="h-5 w-5 text-indigo-400" />
               </div>
               <div>
                 <h3 className="font-semibold text-sm">Customer Support Interaction</h3>
                 <p className="text-xs text-slate-500">Ticket ID: {id.substring(0,8)}</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleEscalate}
                disabled={actionLoading || ticket.status === 'in_progress'}
                className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                {ticket.status === 'in_progress' ? 'Escalated' : 'Escalate'}
              </button>
              <button 
                onClick={handleResolve}
                disabled={actionLoading || ticket.status === 'resolved'}
                className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {ticket.status === 'resolved' ? 'Resolved' : 'Resolve'}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {ticket.messages?.map((msg: any) => (
              <div key={msg.id} className={cn(
                "flex gap-4 max-w-[80%]",
                msg.role === 'assistant' ? "ml-auto flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === 'assistant' ? "bg-indigo-600" : "bg-slate-700"
                )}>
                  {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <div className={cn(
                    "p-4 rounded-2xl text-sm",
                    msg.role === 'assistant' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-800 text-slate-100 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <div className={cn(
                    "text-[10px] text-slate-500",
                    msg.role === 'assistant' ? "text-right" : ""
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Ticket Info</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={cn(
                  "capitalize font-medium",
                  ticket.status === 'resolved' ? "text-emerald-400" :
                  ticket.status === 'open' ? "text-blue-400" : "text-amber-400"
                )}>{ticket.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Channel</span>
                <div className="flex items-center gap-2 font-medium">
                  {ticket.source_channel === 'whatsapp' && <Smartphone className="h-3.5 w-3.5" />}
                  {ticket.source_channel === 'gmail' && <Mail className="h-3.5 w-3.5" />}
                  {ticket.source_channel === 'web_form' && <Globe className="h-3.5 w-3.5" />}
                  <span className="capitalize">{ticket.source_channel.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Priority</span>
                <span className="capitalize font-medium px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[10px] font-bold">
                  {ticket.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
             <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Timeline</h4>
             <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="relative">
                     <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />
                     <div className="absolute top-4 left-0.5 w-[1px] h-8 bg-slate-800" />
                   </div>
                   <div className="text-xs">
                     <p className="font-medium">Ticket Created</p>
                     <p className="text-slate-500">{new Date(ticket.created_at).toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <div className="h-2 w-2 rounded-full bg-slate-700 mt-1.5" />
                   <div className="text-xs">
                     <p className="font-medium text-slate-500">Assigned to AI Agent</p>
                     <p className="text-slate-600">Immediate</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
