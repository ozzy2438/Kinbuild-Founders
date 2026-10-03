/** The three pieces of the gateway double as the three broad founder strengths. */
export type RoleId = 'build' | 'design' | 'grow'
export type Piece = 'left' | 'right' | 'top'

export const roles: { id: RoleId; piece: Piece; label: string; verb: string; seeking: string; covers: string; skill: string }[] = [
  { id: 'build', piece: 'left', label: 'Build', verb: 'I build', seeking: 'someone who builds', covers: 'Engineering, data, the product itself', skill: 'Engineering & development' },
  { id: 'design', piece: 'right', label: 'Design', verb: 'I design', seeking: 'someone who designs', covers: 'Product, design, the experience', skill: 'Design & user experience' },
  { id: 'grow', piece: 'top', label: 'Grow', verb: 'I grow', seeking: 'someone who grows it', covers: 'Marketing, sales, operations, industry know-how', skill: 'Marketing & growth' },
]

export const roleFor = (id: RoleId) => roles.find(role => role.id === id)!

/** Form skills grouped by role, used for matching and anonymous community totals. */
export const skillRole: Record<string, RoleId | undefined> = {
  'Engineering & development': 'build',
  'Research & data': 'build',
  'Design & user experience': 'design',
  'Product & strategy': 'design',
  'Marketing & growth': 'grow',
  'Sales & partnerships': 'grow',
  'Operations & finance': 'grow',
  'Industry expertise': 'grow',
}

export const seekingOptions = [
  { value: 'Build', label: 'Someone who builds', hint: 'Engineering, data' },
  { value: 'Design', label: 'Someone who designs', hint: 'Product, UX' },
  { value: 'Grow', label: 'Someone who grows it', hint: 'Marketing, sales, ops' },
  { value: 'Open', label: 'Open to anyone', hint: 'Let the fit decide' },
] as const

export const workingStyles = [
  { value: 'Taking the lead', hint: 'Set direction, keep things moving' },
  { value: 'Hands-on making', hint: 'Heads down on the work itself' },
  { value: 'Supporting the team', hint: 'Make everyone around you better' },
  { value: 'Still finding out', hint: 'Happy to learn what fits' },
] as const

export const weeklyHours = [
  { value: 'Under 4 hours', hint: 'Tight at the moment' },
  { value: '4–6 hours', hint: 'What the trial asks for' },
  { value: 'More than 6 hours', hint: 'Room to spare' },
] as const

export const availability = ['Weekday evenings', 'Weekday daytime', 'Weekends', 'Flexible'] as const

export type Preset = { skill: string; seeking: string[]; nonce: number }
