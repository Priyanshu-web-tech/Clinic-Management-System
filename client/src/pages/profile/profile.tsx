import { useAppSelector } from "@/store/hook"
import { UserType } from "@/types/api.types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import PersonalInfoTab from "./personal-info-tab"
import EditProfileTab from "./edit-profile-tab"
import HospitalTab from "./hospital-tab"
import PasswordTab from "./password-tab"
import SettingsTab from "./settings-tab"

const Profile = () => {
  const userType = useAppSelector((state) => state.userData.userType)
  const isDoctor = userType === UserType.Doctor

  return (
    <div className="p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <Tabs defaultValue="info">
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-max">
              <TabsTrigger value="info">Personal info</TabsTrigger>
              <TabsTrigger value="edit">Edit profile</TabsTrigger>
              {isDoctor && <TabsTrigger value="hospital">Hospital</TabsTrigger>}
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info">
            <PersonalInfoTab />
          </TabsContent>

          <TabsContent value="edit">
            <EditProfileTab />
          </TabsContent>

          {isDoctor && (
            <TabsContent value="hospital">
              <HospitalTab />
            </TabsContent>
          )}

          <TabsContent value="password">
            <PasswordTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Profile
