import { useEffect } from "react"

import { useGetMeQuery } from "@/store/api/auth-api-slice"
import { setUserData } from "@/store/slices/user-data-slice"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { getInitials } from "@/utils/helpers"
import { USER_TYPE_LABEL, DESIGNATION_LABEL } from "@/constants/constants"
import { UserType } from "@/types/api.types"

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
)

const PersonalInfoTab = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.userData)
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (data?.result) {
      dispatch(setUserData(data.result))
    }
  }, [data, dispatch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    )
  }

  if (isError || !data?.result) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-destructive">Failed to load profile.</p>
      </div>
    )
  }

  const profile = data.result

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div>
          <p className="font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
        <ProfileRow label="Email" value={profile.email} />
        {profile.phone && <ProfileRow label="Phone" value={profile.phone} />}
        <ProfileRow
          label="Role"
          value={USER_TYPE_LABEL[profile.userType] ?? profile.userType}
        />
        {profile.userType === UserType.Staff && profile.designation && (
          <ProfileRow
            label="Designation"
            value={
              DESIGNATION_LABEL[profile.designation] ?? profile.designation
            }
          />
        )}
        {profile.hospital && (
          <>
            <ProfileRow label="Hospital" value={profile.hospital.name} />
            {profile.hospital.address && (
              <ProfileRow label="Address" value={profile.hospital.address} />
            )}
          </>
        )}
        <ProfileRow
          label="Member since"
          value={new Date(profile.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>
    </div>
  )
}

export default PersonalInfoTab
