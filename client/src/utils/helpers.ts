export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName || !lastName) return "?"
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export const getStoredOtpSecondsLeft = (cooldownSecs: number): number => {
  const raw = localStorage.getItem("otpSentAt")
  if (!raw) return 0
  const sentAt = parseInt(raw, 10)
  return Math.max(
    0,
    Math.ceil((sentAt + cooldownSecs * 1000 - Date.now()) / 1000)
  )
}
