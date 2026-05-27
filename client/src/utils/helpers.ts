import { differenceInDays, differenceInMonths, differenceInYears, parseISO, format } from "date-fns"

export const formatAge = (dob: string): string => {
  const date = parseISO(dob)
  const years = differenceInYears(new Date(), date)
  if (years >= 1) return `${years} yrs`
  const months = differenceInMonths(new Date(), date)
  if (months >= 1) return `${months} mo`
  return `${differenceInDays(new Date(), date)} days`
}

export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName || !lastName) return "?"
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export const getGreeting = (): string => {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export const formatTodayDate = (): string => format(new Date(), "EEEE, MMMM d, yyyy")

export const getStoredOtpSecondsLeft = (cooldownSecs: number): number => {
  const raw = localStorage.getItem("otpSentAt")
  if (!raw) return 0
  const sentAt = parseInt(raw, 10)
  return Math.max(
    0,
    Math.ceil((sentAt + cooldownSecs * 1000 - Date.now()) / 1000)
  )
}
