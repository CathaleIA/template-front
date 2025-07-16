// types/user.ts

export interface UserInfo {
  userName: string
  tenantId: string
  userRole: string
  email: string
  statusState: string
  isEnabled: boolean
  createdDate: string
  modifiedDate: string
  tenantName: string
  tenantTier: string
}

export interface UsersInfo {
  userName: string
  userRole: string
  email: string
  statusState: string
  isEnabled: boolean
  createdDate: string
  modifiedDate: string
}

export interface NavUserData {
  name: string
  email: string
  avatar: string
}

export interface CreateUserData {
  userName: string
  userEmail: string
  userRole: "TenantAdmin" | "TenantUser" | ""
}