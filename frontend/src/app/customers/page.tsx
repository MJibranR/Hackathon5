"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Users as UsersIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Search,
  MoreVertical,
  ExternalLink
} from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("http://localhost:8000/api/customers")
      .then(res => res.json())
      .then(data => {
        setCustomers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching customers:", err)
        setLoading(false)
      })
  }, [])

  const getDisplayName = (customer: Customer) => {
    if (customer.name && customer.name !== "Unknown Customer" && customer.name !== "Unknown") {
      return customer.name
    }
    if (customer.email) {
      return customer.email.split("@")[0]
    }
    return "Anonymous Customer"
  }

  const filteredCustomers = customers.filter(c => 
    getDisplayName(c).toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-slate-900 rounded-lg w-1/4" />
      <div className="h-64 bg-slate-900 rounded-xl" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-slate-400">Manage and view your unified customer profiles.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 w-96">
          <Search className="h-5 w-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Contact</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Joined</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                      {getDisplayName(customer).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{getDisplayName(customer)}</div>
                      <div className="text-xs text-slate-500">ID: {customer.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Mail className="h-3 w-3 text-slate-500" />
                      {customer.email || "No email"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(customer.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/tickets?customerId=${customer.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                  >
                    View History
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No customers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
