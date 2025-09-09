// components/skeleton/motor-analysis-skeleton.tsx
'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import * as motion from "motion/react-client"

export function MotorAnalysisSkeleton() {
    return (
        <div className="flex flex-col items-center gap-4 p-5">
            {/* Skeleton del PageHeader */}
            <div className="card-generic p-5 w-[100%]">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-64 rounded" /> {/* Título */}
                        <Skeleton className="h-4 w-80 mt-2 rounded" /> {/* Descripción */}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded" /> {/* "Procesando..." */}
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-4 w-full'>
                {/* Skeleton: Stats Overview (4 tarjetas) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-bg-white rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-4 w-32 mb-2 rounded" />
                                    <Skeleton className="h-8 w-16 rounded" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skeleton: Gráfico + Análisis (2 columnas) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Skeleton: Chart Section */}
                    <div className="bg-bg-white rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-6 w-48 rounded" />
                            <Skeleton className="h-8 w-32 rounded" /> {/* Select */}
                        </div>
                        <div className="w-full h-72 bg-muted rounded-lg relative overflow-hidden">
                            {/* Grid lines simuladas */}
                            <div className="absolute inset-0">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="absolute w-full h-px bg-border" style={{ top: `${(i + 1) * 16.66}%` }} />
                                ))}
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="absolute h-full w-px bg-border" style={{ left: `${(i + 1) * 12.5}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Skeleton: Trend Analysis */}
                    <div className="bg-bg-white rounded-lg p-6">
                        <Skeleton className="h-6 w-48 mb-4 rounded" /> {/* Título */}
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: i * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <div>
                                            <Skeleton className="h-4 w-24 mb-1 rounded" />
                                            <Skeleton className="h-3 w-20 rounded" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Skeleton className="h-4 w-16 mb-1 rounded" />
                                        <Skeleton className="h-3 w-12 rounded" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}