/** @jsx jsx */

// I'm overriding this component just to add `rel="me"` to external links.

import { jsx, useColorMode, Styled } from "theme-ui"
import { Link } from "gatsby"
import { Flex } from "theme-ui"
import useSiteMetadata from "../../../hooks/use-site-metadata"
import ColorModeToggle from "@lekoarts/gatsby-theme-minimal-blog/src/components/colormode-toggle"
import useNavigation from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-navigation"
import Navigation from "@lekoarts/gatsby-theme-minimal-blog/src/components/navigation"
import replaceSlashes from "@lekoarts/gatsby-theme-minimal-blog/src/utils/replaceSlashes"

const Header = () => {
  const { siteTitle, externalLinks, basePath } = useSiteMetadata()
  const nav = useNavigation()
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`
  const toggleColorMode = (e: any) => {
    e.preventDefault()
    setColorMode(isDark ? `light` : `dark`)
  }

  return (
    <header sx={{ mb: [5, 6] }}>
      <Flex sx={{ alignItems: `center`, justifyContent: `space-between` }}>
        <Link
          to={replaceSlashes(`/${basePath}`)}
          aria-label={`${siteTitle} - Back to home`}
          sx={{ color: `heading`, textDecoration: `none` }}
        >
          <h1 sx={{ my: 0, fontWeight: `medium`, fontSize: [3, 4] }}>
            {siteTitle}
          </h1>
        </Link>
        <ColorModeToggle isDark={isDark} toggle={toggleColorMode} />
      </Flex>
      <div
        sx={{
          boxSizing: `border-box`,
          display: `flex`,
          variant: `dividers.bottom`,
          alignItems: `center`,
          justifyContent: `space-between`,
          mt: 3,
          color: `secondary`,
          a: { color: `secondary`, ":hover": { color: `heading` } },
          flexFlow: `wrap`
        }}
      >
        <Navigation nav={nav} />
        <div sx={{ "a:not(:first-of-type)": { ml: 3 }, fontSize: [1, `18px`] }}>
          {externalLinks.map(link => (
            <Styled.a key={link.url} href={link.url} rel={link.rel}>
              {link.name}
            </Styled.a>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header
