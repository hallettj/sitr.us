/** @jsx jsx */
import { ReactNode } from "react"
import { jsx } from "theme-ui"

/**
 * Image with caption
 */
export const ImgCap = ({
  children,
  src
}: {
  children: ReactNode[]
  src: string
}) => {
  return (
    <figure>
      <img src={src} />
      <figcaption>{children}</figcaption>
    </figure>
  )
}
