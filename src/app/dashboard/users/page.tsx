
import { DataTable } from "./data-table"
import { columns } from "./columns"
import type { UsersInfo } from "@/types/user"

async function getUsers(): Promise<UsersInfo[]> {
  try {
    const mappedUsers: UsersInfo[] = [
      {
        userName: "jperez",
        userRole: "admin",
        email: "jperez@example.com",
        statusState: "active",
        isEnabled: true,
        createdDate: "2023-01-15T10:30:00Z",
        modifiedDate: "2023-06-20T14:45:00Z"
      },
      {
        userName: "mgarcia",
        userRole: "user",
        email: "mgarcia@example.com",
        statusState: "pending",
        isEnabled: false,
        createdDate: "2023-03-10T08:15:00Z",
        modifiedDate: "2023-05-05T11:20:00Z"
      }
    ];
    return mappedUsers;
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">
            Manage and view all users in the system
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  )
}