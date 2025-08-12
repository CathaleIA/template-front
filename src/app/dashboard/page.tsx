'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'


export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect a la primera sección después de un breve delay
    const timer = setTimeout(() => {
      router.push('/dashboard/activo') // o la primera ruta de tu sidebar
    }, 50)

    return () => clearTimeout(timer)
  }, [router])

  return (

    <div className="flex flex-1 flex-col gap-4 p-4 items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Cargando Dashboard...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}