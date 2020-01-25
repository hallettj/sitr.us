/** @jsx jsx */
import { jsx, Styled } from "theme-ui"

const Footer = () => {
  return (
    <footer
      sx={{
        boxSizing: `border-box`,
        display: `flex`,
        justifyContent: `space-between`,
        mt: [6],
        color: `secondary`,
        a: {
          variant: `links.secondary`
        },
        flexDirection: [`column`, `column`, `row`],
        variant: `dividers.top`
      }}
    >
      <div>
        <p>
          Copyright &copy; 2007&ndash;{new Date().getFullYear()} by Jesse
          Hallett.
        </p>
        <p>
          This work is licensed under a{" "}
          <Styled.a
            rel="license"
            href="http://creativecommons.org/licenses/by-sa/4.0/"
          >
            Creative Commons Attribution-ShareAlike 4.0 International License.{" "}
            <img
              alt="Creative Commons License"
              sx={{ borderWidth: 0, verticalAlign: "middle" }}
              src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png"
            />
          </Styled.a>
        </p>
      </div>
      <div>
        <Styled.a
          aria-label="Link to the theme's GitHub repository"
          href="https://github.com/LekoArts/gatsby-themes/tree/master/themes/gatsby-theme-minimal-blog"
        >
          Theme
        </Styled.a>
        {` `}
        by
        {` `}
        <Styled.a
          aria-label="Link to the theme author's website"
          href="https://www.lekoarts.de/en"
        >
          LekoArts
        </Styled.a>
      </div>
    </footer>
  )
}

export default Footer
