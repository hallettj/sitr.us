import { graphql } from "gatsby"
import BlogComponent from "@lekoarts/gatsby-theme-minimal-blog-core/src/templates/blog-query"

export default BlogComponent

export const query = graphql`
  query {
    allPost(sort: { fields: date, order: DESC }) {
      nodes {
        slug
        title
        date(formatString: "YYYY-MM-DD")
        tags {
          name
          slug
        }
      }
    }
  }
`
