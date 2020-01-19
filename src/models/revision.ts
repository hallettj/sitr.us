export interface Revision {
  date: string
  message?: string
}

/**
 * Sort most recent revision first
 */
export function sortedRevisions(revisions: Revision[] | undefined): Revision[] {
  if (!revisions) {
    return []
  }
  return [...revisions].sort((a, b) => (a.date < b.date ? -1 : 1))
}
