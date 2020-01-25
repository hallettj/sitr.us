/** @jsx jsx */
import { jsx } from "theme-ui"

const border = {
  border: "#fff 0.5rem solid",
  borderRadius: "0.3rem",
  boxShadow: "rgba(0, 0, 0, 0.15) 0 1px 4px"
}

export const Img = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <img
      sx={{
        ...border,
        maxWidth: "100%"
      }}
      src={src}
      alt={alt}
    />
  )
}

type ImgCapProps = {
  children: string
  float?: "left" | "right"
  src: string
}

export const ImpCap = ({ children, float, src }: ImgCapProps) => {
  return (
    <figure
      sx={{
        ...border,
        display: "inline-block",
        float,
        marginBottom: float ? "8px" : "10px",
        marginLeft: float === "right" ? "1.5em" : undefined,
        marginRight: float === "left" ? "1.5em" : undefined,
        maxWidth: "100%"
      }}
    >
      <img src={src} alt={children} />
      <figcaption>{children}</figcaption>
    </figure>
  )
}
