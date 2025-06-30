// types/user.ts

export interface UserInfo {
  userId: string
  userName: string
  email: string
  tenantId: string
  userRole: string
  createdDate: string
  modifiedDate: string
  isEnabled: boolean
  tenantName: string
  tenantTier: string
}

export interface NavUserData {
  name: string
  email: string
  avatar: string
}

