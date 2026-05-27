const FREQ_STEPS = [0, 0.5, 1, 2, 3]

interface FreqToggleProps {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

const FreqToggle = ({ value, disabled = false, onChange }: FreqToggleProps) => {
  const handleClick = () => {
    const idx = FREQ_STEPS.indexOf(value)
    onChange(FREQ_STEPS[(idx + 1) % FREQ_STEPS.length])
  }
  const active = value > 0
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`w-full rounded-sm border py-1 text-center text-xs font-medium transition-colors focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-input bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
    >
      {value}
    </button>
  )
}

export { FreqToggle, FREQ_STEPS }
