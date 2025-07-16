import { HeaderSkeleton } from "@/components/skeleton/app-header-skeleton";


export function AppPageLoading() {
  return (
    <div className="container mx-auto">
      <HeaderSkeleton />
      <div className="flex justify-center items-center py-12">
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="font-semibold text-gray-600">Cargando datos, porfavor espere...</p>
        </div>
      </div>
    </div>
  )
}
