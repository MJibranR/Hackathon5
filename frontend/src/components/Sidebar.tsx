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
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"

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

  return (
    <div className="flex h-auto md:h-full md:min-h-screen w-full md:w-64 flex-col bg-slate-900 text-white border-b md:border-b-0 md:border-r border-slate-800">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <ShieldCheck className="h-8 w-8 text-indigo-400" />
        <span className="text-xl font-bold tracking-tight">NovaSaaS</span>
      </div>
      
      <div className="flex flex-row md:flex-col flex-1 overflow-x-auto md:overflow-y-auto no-scrollbar">
        <nav className="flex flex-row md:flex-col flex-1 space-x-1 md:space-x-0 md:space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-0 md:mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
                )} />
                <span className="hidden md:block">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 px-3 py-4 border-l md:border-l-0 md:border-t border-slate-800">
          {secondaryNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            >
              <item.icon className="mr-0 md:mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white" />
              <span className="hidden md:block">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
