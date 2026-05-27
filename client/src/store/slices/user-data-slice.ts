import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { UserType, type Designation } from "@/types/api.types"

export interface IUserSessionData {
  _id: string
  userType: UserType
  firstName: string
  lastName: string
  email: string
  designation?: Designation | null
  createdAt: string
  updatedAt: string
  isSignedIn?: boolean
}

const initialState: IUserSessionData = {
  _id: "",
  userType: UserType.Doctor,
  firstName: "",
  lastName: "",
  email: "",
  designation: null,
  createdAt: "",
  updatedAt: "",
  isSignedIn: false,
}

const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUserData: (_, action: PayloadAction<IUserSessionData>) => {
      return { ...action.payload, isSignedIn: true }
    },
    clearUserData: () => initialState,
  },
})

export const { setUserData, clearUserData } = userDataSlice.actions
export default userDataSlice.reducer
