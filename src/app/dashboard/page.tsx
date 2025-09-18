'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export default function DashboardPage() {
  const router = useRouter()
  const { userr } = useUser();

  console.log("desde dashboard page:", userr)

  // ✅ Redirigir cuando userr esté cargado y tenga userName
  useEffect(() => {
    if (userr?.userName) {
      router.push(`/dashboard/users/${userr.userName}`)
    }
  }, [userr, router]) // <-- Dependencias correctas: userr y router

  // Mientras carga o si no hay usuario, mostrar loader
  if (!userr?.userName) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cargando Dashboard...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  // Este return nunca se alcanzará si hay redirección, pero es bueno tenerlo
  return null
}