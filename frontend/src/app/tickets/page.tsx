"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  ChevronRight,
  Mail,
  Smartphone,
  Globe,
  MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const searchParams = useSearchParams()
  const customerIdFilter = searchParams.get("customerId")

  useEffect(() => {
    let url = "http://localhost:8000/api/tickets"
    if (customerIdFilter) {
      // Assuming the API supports filtering by customer_id
      url += `?customer_id=${customerIdFilter}`
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTickets(data)
        setLoading(false)
      })
  }, [customerIdFilter])

  const filteredTickets = tickets.filter((t: any) => {
    const matchesSearch = t.id.toLowerCase().includes(search.toLowerCase()) || 
                         (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-slate-400">
            {customerIdFilter ? `Viewing tickets for Customer ${customerIdFilter.slice(0,8)}` : "Manage and respond to all customer interactions."}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by ID or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {customerIdFilter && (
            <Link href="/tickets" className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-700">
              Clear Filter
            </Link>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="px-6 py-4">Ticket ID</th>
              <th className="px-6 py-4">Channel</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              [1,2,3,4,5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4 h-16 bg-slate-900/50"></td>
                </tr>
              ))
            ) : filteredTickets.length > 0 ? filteredTickets.map((ticket: any) => (
              <tr key={ticket.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium">#{ticket.id.substring(0,8)}</div>
                  <div className="text-xs text-slate-500">{ticket.category || 'General Inquiry'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {ticket.source_channel === 'whatsapp' && <Smartphone className="h-4 w-4 text-emerald-400" />}
                    {ticket.source_channel === 'gmail' && <Mail className="h-4 w-4 text-rose-400" />}
                    {ticket.source_channel === 'web_form' && <Globe className="h-4 w-4 text-blue-400" />}
                    <span className="capitalize text-sm">{ticket.source_channel.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                    ticket.priority === 'high' || ticket.priority === 'urgent' ? "bg-rose-500/10 text-rose-500" :
                    ticket.priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
                    "bg-slate-500/10 text-slate-500"
                  )}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <div className={cn(
                       "h-2 w-2 rounded-full",
                       ticket.status === 'open' ? "bg-emerald-500" : 
                       ticket.status === 'in_progress' ? "bg-amber-500" : "bg-slate-500"
                     )} />
                     <span className="capitalize text-sm">{ticket.status}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/tickets/${ticket.id}`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                  No tickets found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
