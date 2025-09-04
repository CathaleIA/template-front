'use client'

import ComputersCanvas from '@/components/threejs/Motor3D'
import { useEffect, useState } from 'react'
import { UsersInfo, ParadasData } from "@/types"
import { columns } from './columns'

import { DataTable } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BorderTrail } from '@/components/motion-primitives/border-trail';
import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"

export default function ActivosPage() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<UsersInfo[]>([])
    const [selectTendency, setselectTendency] = useState<'motor' | 'turbine'>('motor');
    const [activeTab, setActiveTab] = useState('indicators')

    const filters = [
        { column: "email", placeholder: "Filter by executor..." },
    ]

    const operationalStats = {
        motor: {
            uptimeHours: 12456,
            downtimeHours: 342,
            stops: 18,
            failures: 5,
            maintenances: 7,
            lastMaintenance: '2025-07-22',
            status: 'Encendido',
        },
        turbine: {
            uptimeHours: 8450,
            downtimeHours: 610,
            stops: 25,
            failures: 9,
            maintenances: 12,
            lastMaintenance: '2025-08-01',
            status: 'Apagado',
        }
    }

    const data2: Array<ParadasData> = [
        {
            operator: "Carlos Amande",
            justify: 'Mantenimiento turbina',
            duration: 9,
            state: 'CERRADA',
            date: '18/03/25 - 22/03/25'
        },
        {
            operator: "Juan Cirus",
            justify: 'Cambio de aceite',
            duration: 9,
            state: 'CERRADA',
            date: '05/01/25 - 05/01/25'
        },
        {
            operator: "Victor Augus",
            justify: 'Mantenimiento preventivo',
            duration: 9,
            state: 'EN CURSO',
            date: '12/08/25 - 12/08/25'
        },
    ]

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true)
                const response = await fetch("/api/users")
                if (!response.ok) {
                    throw new Error("Failed to fetch users")
                }

                const rawData = await response.json()
                const mappedUsers: UsersInfo[] = rawData.map((data: any) => ({
                    userName: data.user_name,
                    userRole: data.user_role,
                    email: data.email,
                    statusState: data.status,
                    isEnabled: data.enabled,
                    createdDate: data.created,
                    modifiedDate: data.modified,
                }))

                setData(mappedUsers)
            } catch (error) {
                console.error("Error fetching users:", error)
            } finally {
                setLoading(false)
            }
        }

        getUsers()
    }, [])
    return (

        <div className='flex flex-col lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-4 p-5'>
            <div className="col-span-1 row-span-1">
                <div className='bg-bg-white h-full flex flex-col card-plotly2'>
                    <Select
                        defaultValue="motor"
                        onValueChange={(value) => setselectTendency(value as 'motor' | 'turbine')}
                    >
                        <SelectTrigger
                            className="relative bg-input/50 text-primary rounded-br-full pr-2 w-[35%] flex items-center justify-center focus:ring-0 focus:ring-offset-0 font-bold text-xs text-muted-foreground"
                        >
                            <BorderTrail
                                style={{
                                    boxShadow: '0px 0px 60px 30px rgb(130 130 130 / 90%), 0 0 60px 20px rgb(255 255 255 / 80%), 0 0 140px 90px rgb(130 130 130 / 50%)',
                                }}
                                size={10}
                            />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-auto">
                            <SelectItem value="motor">MOTOR</SelectItem>
                            <SelectItem value="turbine">TURBINA</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className=' flex-1 min-h-0'>
                        {selectTendency === 'motor' ? (
                            <ComputersCanvas url='/models/motor.glb' />
                        ) : selectTendency === 'turbine' ? (
                            <ComputersCanvas url='/models/turbine.glb' />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='col-span-1 row-span-1'>
                <div className='grid grid-rows-[auto_1fr] h-full bg-background rounded-tr-2xl rounded-tl-2xl border overflow-hidden'>
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab?.('specs')}
                            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${activeTab === 'specs'
                                ? 'bg-input text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase border-b-5 border-primary'
                                : 'text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase hover:text-foreground'
                                }`}
                        >
                            Especificaciones
                        </button>
                        <button
                            onClick={() => setActiveTab?.('indicators')}
                            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${activeTab === 'indicators'
                                ? 'bg-primary/10 text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase border-b-5 border-primary'
                                : 'text-muted-foreground text-sm font-semibold leading-none tracking-tight text-muted-foreground uppercase hover:text-foreground'
                                }`}
                        >
                            Indicadores
                        </button>
                    </div>
                    <div className="relative overflow-hidden">
               
                        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out p-4 ${activeTab === 'specs' ? 'translate-x-0' : '-translate-x-full'
                            }`}>
                            <div className="space-y-3 h-full overflow-y-auto">
                                <div className="grid gap-3">
                                    <div className="group relative p-3 border border-border/50 rounded-lg bg-gradient-to-r from-muted/20 to-muted/40 hover:from-muted/30 hover:to-muted/50 transition-all">
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Marca / Referencia</div>
                                        <div className="font-mono text-sm text-foreground">Valor dinámico</div>
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"></div>
                                    </div>

                                    <div className="group relative p-3 border border-border/50 rounded-lg bg-gradient-to-r from-muted/20 to-muted/40 hover:from-muted/30 hover:to-muted/50 transition-all">
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Modelo / Año</div>
                                        <div className="font-mono text-sm text-foreground">Valor dinámico</div>
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"></div>
                                    </div>

                                    <div className="group relative p-3 border border-border/50 rounded-lg bg-gradient-to-r from-muted/20 to-muted/40 hover:from-muted/30 hover:to-muted/50 transition-all">
                                        <div className="text-xs font-medium text-muted-foreground mb-1">Manuales / Sitio</div>
                                        <div className="font-mono text-sm text-foreground">Valor dinámico</div>
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                  
                        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out p-4 ${activeTab === 'indicators' ? 'translate-x-0' : 'translate-x-full'
                            }`}>
                            <div className="h-full overflow-y-auto">
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(operationalStats[selectTendency]).map(([key, value], index) => {
                                        const labels: Record<string, string> = {
                                            uptimeHours: 'Encendido',
                                            downtimeHours: 'Apagado',
                                            stops: 'Paradas',
                                            failures: 'Fallos',
                                            maintenances: 'Mantenimientos',
                                            lastMaintenance: 'Último mant.',
                                            status: 'Estado'
                                        };

                                        const colors = [
                                            'border-l-gray-200',
                                            'border-l-gray-400',
                                            'border-l-gray-200',
                                            'border-l-gray-400',
                                            'border-l-gray-200',
                                            'border-l-gray-400',
                                        ];

                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center justify-between p-2 border-l-4 ${colors[index % colors.length]} bg-muted/20 rounded-r-lg hover:bg-muted/40 transition-all group`}
                                            >
                                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                                    {labels[key] || key}
                                                </span>
                                                <span className="text-sm font-bold text-foreground">
                                                    {typeof value === 'number' ? `${value}${key.includes('Hours') ? 'h' : ''}` : value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='col-span-2 row-span-1 overflow-y-auto'>
                <div className="bg-background rounded-lg shadow-sm p-6 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Registro de paradas</h2>
                    <DataTable columns={columns} data={data2} />
                </div>
            </div>
        </div>
    );
}