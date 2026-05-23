import type { UserType } from "@/types/api.types"

export interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  userType: UserType | ""
}
