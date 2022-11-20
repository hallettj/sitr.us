// I'm overriding the hook from
// @lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata.tsx to add
// the `rel` attribute to external links.
import { graphql, useStaticQuery } from "gatsby"

type Props = {
  site: {
    siteMetadata: {
      siteTitle: string
      siteTitleAlt: string
      siteHeadline: string
      siteUrl: string
      siteDescription: string
      siteLanguage: string
      siteImage: string
      author: string
      externalLinks: {
        name: string
        url: string
        rel?: string
      }[]
      tagsPath: string
      basePath: string
      blogPath: string
      showLineNumbers: boolean
    }
  }
}

const useSiteMetadata = () => {
  const data = useStaticQuery<Props>(graphql`
    query {
      site {
        siteMetadata {
          siteTitle
          siteTitleAlt
          siteHeadline
          siteUrl
          siteDescription
          siteLanguage
          siteImage
          author
          externalLinks {
            name
            url
            rel
          }
          tagsPath
          basePath
          blogPath
          showLineNumbers
        }
      }
    }
  `)

  return data.site.siteMetadata
}

export default useSiteMetadata
