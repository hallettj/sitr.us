import { graphql } from "gatsby"
import PostComponent from "@lekoarts/gatsby-theme-minimal-blog-core/src/templates/post-query"

export default PostComponent

export const query = graphql`
  query($slug: String!) {
    post(slug: { eq: $slug }) {
      slug
      title
      date(formatString: "YYYY-MM-DD")
      tags {
        name
        slug
      }
      description
      body
      excerpt
      timeToRead
      banner {
        childImageSharp {
          resize(width: 1200, quality: 90) {
            src
          }
        }
      }
    }
    mdx(frontmatter: { slug: { eq: $slug } }) {
      frontmatter {
        revisions {
          date(formatString: "YYYY-MM-DD")
          message
        }
      }
      headings {
        depth
        value
      }
    }
  }
`
