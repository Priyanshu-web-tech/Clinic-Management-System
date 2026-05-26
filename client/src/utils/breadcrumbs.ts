export type Crumb = { label: string; href?: string }

const SEGMENT_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Team",
  patients: "Patients",
  visits: "Visits",
  profile: "Profile",
}

const DETAIL_LABEL: Record<string, string> = {
  visits: "Consultation",
  patients: "Patient Detail",
}

export const buildCrumbs = (pathname: string): Crumb[] => {
  const segments = pathname.split("/").filter(Boolean)
  return segments.map((seg, i) => {
    const isLast = i === segments.length - 1
    const href = "/" + segments.slice(0, i + 1).join("/")
    const isId = /^[a-f0-9]{24}$/.test(seg)
    if (isId) {
      return { label: DETAIL_LABEL[segments[i - 1]] ?? "Detail" }
    }
    return { label: SEGMENT_LABEL[seg] ?? seg, href: isLast ? undefined : href }
  })
}
