"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  BarChart3, 
  LifeBuoy, 
  Settings,
  ShieldCheck,
  Mail,
  Smartphone,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

const secondaryNavigation = [
  { name: "Support Form", href: "/support", icon: LifeBuoy },
  { name: "Gmail", href: "/gmail", icon: Mail },
  { name: "WhatsApp", href: "/whatsapp", icon: Smartphone },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <ShieldCheck className="h-8 w-8 text-indigo-500" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">NovaSaaS</span>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 px-3">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Integrations</p>
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
           <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">JD</div>
           <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Jibran Rehan</p>
              <p className="text-[10px] text-slate-500 truncate">Admin Dashboard</p>
           </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between px-6 bg-slate-900 border-b border-slate-800 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">NovaSaaS</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col">
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800 sticky top-0 shrink-0">
        <NavContent />
      </aside>
    </>
  )
}
