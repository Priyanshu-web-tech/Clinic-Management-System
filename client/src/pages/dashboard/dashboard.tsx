import { useAppSelector } from "@/store/hook"

const Dashboard = () => {
  const user = useAppSelector((state) => state.userData)

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Welcome back, {user.firstName} {user.lastName}
      </h2>
    </div>
  )
}

export default Dashboard
