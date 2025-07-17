import { SelectTenant } from "@/components/select-tenant-form"

export default function LoginPage() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10"
      style={{
        backgroundImage: 'var(--background-image)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-sm md:max-w-3xl">
        <SelectTenant />
      </div>
    </div>
  )
}
