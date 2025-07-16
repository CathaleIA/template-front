import { Skeleton } from "@/components/ui/skeleton"

export function HeaderSkeleton() {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-5 mb-10">
      <div className="grid grid-cols-[1fr_auto] gap-4 pb-2">
        <div className="flex flex-col justify-end">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        {/* Columna derecha: skeleton del botón */}
        <div className="flex justify-end items-end h-full">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
