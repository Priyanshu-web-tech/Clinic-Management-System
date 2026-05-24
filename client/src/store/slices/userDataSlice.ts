import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { UserType } from "@/types/api.types"

export interface IUserSessionData {
  _id: string
  user_type: UserType
  first_name: string
  last_name: string
  email: string
  createdAt: string
  updatedAt: string
  isSignedIn?: boolean
}

const initialState: IUserSessionData = {
  _id: "",
  user_type: "doctor",
  first_name: "",
  last_name: "",
  email: "",
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
