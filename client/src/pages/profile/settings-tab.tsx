import { useTheme } from "@/components/theme-provider"
import { Monitor, Moon, Sun } from "lucide-react"

type ThemeOption = {
  value: "system" | "light" | "dark"
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

const themeOptions: ThemeOption[] = [
  { value: "system", label: "Device setting", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
]

const SettingsTab = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mt-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Appearance</h3>
        <div className="flex gap-3">
          {themeOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 w-28 transition-colors cursor-pointer
                ${
                  theme === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
            >
              <Icon className={`h-5 w-5 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${theme === value ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
