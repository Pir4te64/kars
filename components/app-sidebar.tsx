"use client"

import type * as React from "react"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Link = require("next/link").default
import { usePathname } from "next/navigation"
import {
  Car,
  Plus,
  List,
  Users,
  DollarSign,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems: { section: string; items: { title: string; url: string; icon: React.ElementType }[] }[] = [
  {
    section: "Contenido",
    items: [
      { title: "Ver Posts", url: "/admin/posts", icon: List },
      { title: "Crear Post", url: "/admin/posts/create", icon: Plus },
    ],
  },
  {
    section: "Precios",
    items: [
      { title: "Ajustes de Precio", url: "/admin/precios", icon: DollarSign },
    ],
  },
  {
    section: "Clientes",
    items: [
      { title: "Leads del Cotizador", url: "/admin/leads", icon: Users },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gray-200 bg-white" {...props}>
      {/* Logo */}
      <SidebarHeader className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
            <Car className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">KARS</p>
            <p className="text-[10px] text-gray-500">Panel de administración</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-3 py-3 space-y-4">
        {/* Dashboard link */}
        <Link
          href="/admin"
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/admin"
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Sections */}
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
                return (
                  <Link
                    key={item.url}
                    href={item.url as string}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.title}
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 px-4 py-3">
        <p className="text-[10px] text-gray-400">KARS Admin v1.0</p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
