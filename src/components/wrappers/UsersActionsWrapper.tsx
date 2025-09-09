"use client"

import { DataTable } from "@/components/ui/data-table"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { useNotifications } from "@/context/notification-context"
import { CreateUserData, UsersInfo } from "@/types"

type Props = {
  columns: any
  data: UsersInfo[]
  filters: { column: string; placeholder: string }[]
}

export function UsersActionsWrapper({ columns, data, filters }: Props) {
  const { addNotification } = useNotifications()

  const handleUserCreated = (user: CreateUserData) => {
    addNotification({
      type: "success",
      title: "Usuario creado exitosamente",
      message: `El nuevo usuario ${user.userName} ha sido agregado al sistema.`,
    })
    // Podrías usar un estado global o un refresh para actualizar la lista
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      filters={filters}
      actions={<CreateUserDialog onUserCreated={handleUserCreated} />}
    />
  )
}
