"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  ChevronRight,
  Mail,
  Smartphone,
  Globe,
  MoreVertical,
  Plus,
  Clock,
  User,
  AlertCircle,
  Ticket as TicketIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"

function TicketsPageContent() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [channelFilter, setChannelFilter] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const customerIdFilter = searchParams.get("customerId")

  useEffect(() => {
    let url = "https://muhammadjibran-hackathon5.hf.space/api/tickets"
    if (customerIdFilter) {
      url += `?customer_id=${customerIdFilter}`
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTickets(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching tickets:", err)
        setLoading(false)
      })
  }, [customerIdFilter])

  const filteredTickets = tickets.filter((t: any) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      (t.id && t.id.toLowerCase().includes(searchTerm)) ||
      (t.channel_message_id && t.channel_message_id.toLowerCase().includes(searchTerm)) ||
      (t.category && t.category.toLowerCase().includes(searchTerm)) ||
      (t.source_channel && t.source_channel.toLowerCase().includes(searchTerm));
    
    const matchesChannel = !channelFilter || t.source_channel === channelFilter;
    
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Support Tickets</h1>
          <p className="text-slate-400 mt-1">
            {customerIdFilter ? `Filtering by Customer ID: ${customerIdFilter.slice(0,8)}...` : "Manage and respond to all incoming customer queries."}
          </p>
        </div>
        <div className="flex items-center gap-3 relative">
           <button 
             onClick={() => setIsCreateOpen(!isCreateOpen)}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
           >
              <Plus className="h-4 w-4" />
              New Ticket
           </button>

           {isCreateOpen && (
             <>
               <div className="fixed inset-0 z-10" onClick={() => setIsCreateOpen(false)} />
               <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 space-y-1">
                     <Link href="/whatsapp" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium group">
                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20">
                           <Smartphone className="h-4 w-4 text-emerald-400" />
                        </div>
                        WhatsApp Ticket
                     </Link>
                     <Link href="/gmail" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium group">
                        <div className="p-2 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20">
                           <Mail className="h-4 w-4 text-rose-400" />
                        </div>
                        Gmail Interaction
                     </Link>
                     <Link href="/support" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium group">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20">
                           <Globe className="h-4 w-4 text-blue-400" />
                        </div>
                        Web Support Form
                     </Link>
                  </div>
               </div>
             </>
           )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tickets by ID, category, or channel..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-slate-900 transition-all"
          />
        </div>
        <div className="flex gap-2 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-2 bg-slate-900 border px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors",
              channelFilter ? "border-indigo-500 text-indigo-400" : "border-slate-800 text-white"
            )}
          >
            <Filter className="h-4 w-4" />
            {channelFilter ? channelFilter.replace('_', ' ').toUpperCase() : "Filters"}
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute left-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { setChannelFilter(null); setIsFilterOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    All Channels
                  </button>
                  <button 
                    onClick={() => { setChannelFilter('whatsapp'); setIsFilterOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm font-medium"
                  >
                    <Smartphone className="h-4 w-4 text-emerald-400" />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => { setChannelFilter('gmail'); setIsFilterOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm font-medium"
                  >
                    <Mail className="h-4 w-4 text-rose-400" />
                    Gmail
                  </button>
                  <button 
                    onClick={() => { setChannelFilter('web_form'); setIsFilterOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm font-medium"
                  >
                    <Globe className="h-4 w-4 text-blue-400" />
                    Web Form
                  </button>
                </div>
              </div>
            </>
          )}

          {customerIdFilter && (
            <Link href="/tickets" className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-all">
              Clear Customer
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/40 border-b border-slate-800 text-[10px] uppercase tracking-[0.1em] text-slate-500 font-black">
            <tr>
              <th className="px-6 py-4">Ticket Info</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              [1,2,3,4,5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-6 h-20">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-slate-800 rounded-lg" />
                       <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-800 rounded" />
                          <div className="h-3 w-20 bg-slate-800 rounded" />
                       </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredTickets.length > 0 ? filteredTickets.map((ticket: any) => (
              <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                       <TicketIcon className="h-5 w-5 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-200">
                        {ticket.channel_message_id ? ticket.channel_message_id.slice(0,12) : `TKT-${ticket.id.substring(0,8).toUpperCase()}`}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{ticket.category || 'General Support'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "p-1.5 rounded-lg",
                      ticket.source_channel === 'whatsapp' ? "bg-emerald-500/10 text-emerald-400" :
                      ticket.source_channel === 'gmail' ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {ticket.source_channel === 'whatsapp' && <Smartphone className="h-4 w-4" />}
                      {ticket.source_channel === 'gmail' && <Mail className="h-4 w-4" />}
                      {ticket.source_channel === 'web_form' && <Globe className="h-4 w-4" />}
                    </div>
                    <span className="capitalize text-xs font-bold text-slate-300">{ticket.source_channel.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    ticket.priority === 'high' || ticket.priority === 'urgent' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                    ticket.priority === 'medium' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  )}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                     <div className={cn(
                       "h-2 w-2 rounded-full",
                       ticket.status === 'open' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                       ticket.status === 'in_progress' ? "bg-amber-500" : "bg-slate-600"
                     )} />
                     <span className="capitalize text-xs font-bold text-slate-300">{ticket.status}</span>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-300">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-500">{new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <Link 
                    href={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    Manage
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-800 rounded-full text-slate-500">
                         <AlertCircle className="h-8 w-8" />
                      </div>
                      <p className="text-slate-400 text-sm font-medium">No tickets found matching your criteria.</p>
                      <button 
                        onClick={() => { setSearch(""); setChannelFilter(null); }} 
                        className="text-indigo-400 text-xs font-bold hover:underline"
                      >
                        Clear all filters
                      </button>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
           [1,2,3].map(i => <div key={i} className="h-40 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />)
        ) : filteredTickets.length > 0 ? filteredTickets.map((ticket: any) => (
          <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block bg-slate-900 p-5 rounded-2xl border border-slate-800 active:bg-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    ticket.source_channel === 'whatsapp' ? "bg-emerald-500/10 text-emerald-400" :
                    ticket.source_channel === 'gmail' ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"
                  )}>
                    {ticket.source_channel === 'whatsapp' && <Smartphone className="h-4 w-4" />}
                    {ticket.source_channel === 'gmail' && <Mail className="h-4 w-4" />}
                    {ticket.source_channel === 'web_form' && <Globe className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">#{ticket.id.slice(0,8).toUpperCase()}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ticket.category || 'General'}</p>
                  </div>
               </div>
               <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                  ticket.priority === 'high' ? "bg-rose-500/10 text-rose-500" : "bg-slate-800 text-slate-400"
                )}>
                  {ticket.priority}
               </span>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
               <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    ticket.status === 'open' ? "bg-emerald-500" : "bg-slate-600"
                  )} />
                  <span className="text-xs font-bold capitalize text-slate-300">{ticket.status}</span>
               </div>
               <span className="text-[10px] text-slate-500 font-medium">{new Date(ticket.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        )) : (
          <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center">
             <p className="text-slate-500 text-sm">No tickets found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Initializing Tickets...</div>}>
      <TicketsPageContent />
    </Suspense>
  )
}
