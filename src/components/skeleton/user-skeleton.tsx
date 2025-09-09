// components/skeleton/user-page-skeleton.tsx
'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import * as motion from "motion/react-client"

export function UserPageSkeleton() {
    return (
        <div className="p-5 h-[calc(100svh-var(--header-height))]! w-full">
            <div className="flex flex-col gap-4 p-5 bg-bg-white">
                {/* Skeleton del PageHeader */}
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 rounded" />
                        <Skeleton className="h-4 w-64 mt-2 rounded" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24 rounded" /> {/* Botón Editar */}
                        <Skeleton className="h-10 w-24 rounded" /> {/* Botón Eliminar */}
                    </div>
                </div>

                <div className="grid md:grid-cols-[3fr_6fr] gap-4">
                    {/* Skeleton: Tarjeta de información básica */}
                    <Card className="flex flex-col items-center justify-center bg-bg-white shadow-none py-5 rounded-xs">
                        <div className="flex flex-col items-center">
                            <Avatar className="size-25">
                                <AvatarFallback>
                                    <Skeleton className="h-full w-full rounded-full" />
                                </AvatarFallback>
                            </Avatar>
                            <Skeleton className="h-6 w-32 mt-4 rounded" />
                        </div>
                        <div className="text-[14px] leading-[32px] p-4 w-full">
                            <div className="flex flex-row gap-1 items-center mb-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex flex-row gap-1 items-center mb-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex flex-row gap-1 items-center mb-4">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="h-[2px] bg-border w-full" />
                        </div>
                    </Card>

                    {/* Skeleton: Tarjeta de tabs y formulario */}
                    <Card className="bg-bg-white shadow-none rounded-xs px-3 py-5">
                        {/* Skeleton de tabs */}
                        <nav className="border-b-2 border-border pb-4">
                            <ul className="flex items-center gap-8">
                                {['Informacion personal', 'Informacion de organizacion', 'Estatus'].map((type, i) => (
                                    <li key={type} className="relative py-3 cursor-pointer">
                                        <Skeleton className="h-5 w-24 rounded" />
                                        {i === 0 && (
                                            <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-link" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Skeleton de campos del formulario */}
                        <div className="p-5 space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-[1fr_8fr] gap-4 pb-4"
                                >
                                    <div className="flex justify-end items-center">
                                        <Skeleton className="h-4 w-20 rounded" />
                                    </div>
                                    <div className="flex justify-start items-center">
                                        <Skeleton className="h-10 w-full rounded" />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Skeleton del botón Guardar (solo en pestaña personal) */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex justify-end pt-2"
                            >
                                <Skeleton className="h-10 w-32 rounded" />
                            </motion.div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}