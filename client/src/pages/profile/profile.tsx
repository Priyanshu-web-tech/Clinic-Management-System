import { useGetMeQuery } from "@/store/api/authApiSlice"

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  deleted: "Deleted",
  deactivated: "Deactivated",
}

const USER_TYPE_LABEL: Record<string, string> = {
  admin: "Admin",
  doctor: "Doctor",
  staff: "Staff",
  pharmacist: "Pharmacist",
}

const Profile = () => {
  const { data, isLoading, isError } = useGetMeQuery()

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    )
  }

  if (isError || !data?.result) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p className="text-sm text-destructive">Failed to load profile.</p>
      </div>
    )
  }

  const profile = data.result

  return (
    <div className="p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {profile.first_name.charAt(0).toUpperCase()}
            {profile.last_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <ProfileRow
            label="Role"
            value={USER_TYPE_LABEL[profile.user_type] ?? profile.user_type}
          />
          <ProfileRow
            label="Status"
            value={STATUS_LABEL[profile.status] ?? profile.status}
          />
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
    </div>
  )
}

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
)

export default Profile
