/**
 * Presentation helpers for the chat UI.
 *
 * COPY RULE: dependency-free; keep byte-identical across vendor-panel,
 * b2c-marketplace-storefront and admin-panel (same as matrix-cards.ts).
 */

/** "EuroMaterials Trading" -> "ET"; "Support" -> "S". */
export const initials = (name?: string): string => {
  if (!name) return '?'
  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .split(' ')
    .filter(Boolean)
  if (words.length === 0) return name.slice(0, 1).toUpperCase()
  return words
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('')
}

const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/**
 * Inbox-row timestamp: "14:02" today, "Yesterday", weekday within a week,
 * else "3 Jul".
 */
export const formatSmartTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)

  if (dayDiff <= 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

/** In-thread bubble timestamp — always time of day. */
export const formatTimeOfDay = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

/** Date-separator label: "Today", "Yesterday", else "3 Jul 2026". */
export const formatDateSeparator = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)

  if (dayDiff <= 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const dayKey = (timestamp: number): string =>
  new Date(timestamp).toDateString()

const GROUP_WINDOW_MS = 5 * 60 * 1000

export type TimelineItem<E> = {
  event: E
  /** First message of a sender-group — show avatar + sender name. */
  groupStart: boolean
  /** Last message of a sender-group — show the timestamp. */
  groupEnd: boolean
  /** Render a date separator above this message. */
  newDay: boolean
}

/**
 * Annotate a chronologically-sorted event list with date-separator and
 * sender-grouping flags (same sender within 5 minutes forms one group).
 */
export const buildTimeline = <E>(
  events: E[],
  getSender: (event: E) => string | undefined,
  getTs: (event: E) => number
): TimelineItem<E>[] =>
  events.map((event, i) => {
    const prev = events[i - 1]
    const next = events[i + 1]
    const newDay = !prev || dayKey(getTs(prev)) !== dayKey(getTs(event))
    const groupStart =
      newDay ||
      !prev ||
      getSender(prev) !== getSender(event) ||
      getTs(event) - getTs(prev) > GROUP_WINDOW_MS
    const groupEnd =
      !next ||
      getSender(next) !== getSender(event) ||
      getTs(next) - getTs(event) > GROUP_WINDOW_MS ||
      dayKey(getTs(next)) !== dayKey(getTs(event))
    return { event, groupStart, groupEnd, newDay }
  })
