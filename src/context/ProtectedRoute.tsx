'use client'

import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { userr, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !userr) {
      // Si no está cargando y no hay usuario, redirige al login
      router.push('/select-tenant')
    }
  }, [userr, loading, router])

  // Mientras carga, muestra un loader o algo
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Cargando...
      </div>
    )
  }

  // Si hay usuario, renderiza el contenido
  if (userr) {
    return <>{children}</>
  }

  return null
}