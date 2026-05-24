import { useAppSelector } from "@/store/hook"

const Dashboard = () => {
  const user = useAppSelector((state) => state.userData)

  return (
    <div className="p-6">
      <p className="text-sm text-muted-foreground">
        Welcome back,{" "}
        <span className="font-medium text-foreground">{user.firstName} {user.lastName}</span>!
      </p>
    </div>
  )
}

export default Dashboard
