/** @jsx jsx */
import React from "react"
import { jsx } from "theme-ui"

type Props = {
  children: React.ReactNode
}

/**
 * Section with a margin-bottom that matches spacing of other sections in the
 * gatsby-theme-minimal-blog homepage.
 */
export const HomepageSection = ({ children }: Props) => (
  <section sx={{ mb: [5, 6, 7] }}>{children}</section>
)
