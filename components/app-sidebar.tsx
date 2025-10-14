"use client"

import type * as React from "react"
import { Car, Plus, List, X } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const data = {
  navMain: [
    {
      title: "POST",
      url: "#",
      icon: Car,
      isActive: true,
      items: [
        {
          title: "Ver Listado de Posts",
          url: "/admin/posts",
          icon: List,
        },
        {
          title: "Crear POST",
          url: "/admin/posts/create",
          icon: Plus,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6" />
            <span className="font-semibold">Dashboard Vehículos</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:flex"
            onClick={() => setOpen(false)}
            title="Cerrar sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
