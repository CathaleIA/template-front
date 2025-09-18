/*Los wrapper son usados para separar funcionalidad del lado del cliente y del servidor
En este caso este se usa para la pagina de "users"
Las consultas se hacen en la pagina principal "server side"
y las otras funcionalidades se hacen en el wrapper "client side"*/

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
