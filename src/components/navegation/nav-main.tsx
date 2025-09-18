"use client"

import { ChevronRight } from "lucide-react"

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
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import {NavItemMain} from "@/types"

import Link from "next/link"

function getSiteLinks(item: NavItemMain): { title: string; url: string }[] {
  return item.sites?.map(site => ({
    title: site.title,
    url: site.url,
  })) ?? []
}

export function NavMain({ items }: { items: NavItemMain[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Servicios</SidebarGroupLabel>
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