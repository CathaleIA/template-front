"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import Link from "next/link"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
  sites?: {
    title: string
    url: string
    sistemas: {
      title: string
      url: string
      items: {
        title: string
        url: string
      }[]
    }[]
  }[]
}

function getSiteLinks(item: NavItem): { title: string; url: string }[] {
  return item.sites?.map(site => ({
    title: site.title,
    url: site.url,
  })) ?? []
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = !!(item.items?.length || item.sites?.length)

          return (
            <SidebarMenuItem key={item.title}>
              {hasSubItems ? (
                <Collapsible defaultOpen={item.isActive} className="group/collapsible">
                  {/* ❌ NO envolver el trigger en SidebarMenuItem */}
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="cursor-pointer" subItems={[...(item.items ?? []), ...getSiteLinks(item)]}>
                      {item.icon && <item.icon className="w-12 h-12 text-white" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      ))}
                      {item.sites?.map((site) => (
                        <Collapsible key={site.title} defaultOpen={item.isActive} className="group/collapsibl">
                          {/* ❌ NO SidebarMenuItem aquí */}
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <span>{site.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsibl:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {site.sistemas?.map((machine) => (
                                <Collapsible key={machine.title} defaultOpen={item.isActive} className="group/collapsib">
                                  {/* ❌ NO SidebarMenuItem aquí */}
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuButton>
                                      <span>{machine.title}</span>
                                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsib:rotate-90" />
                                    </SidebarMenuButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {machine.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                          <SidebarMenuButton asChild>
                                            <Link href={subItem.url}>
                                              <span>{subItem.title}</span>
                                            </Link>
                                          </SidebarMenuButton>
                                        </SidebarMenuSubItem>
                                      ))}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon className="w-12 h-12" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}