import { graphql } from "gatsby"
import HomepageComponent from "@lekoarts/gatsby-theme-minimal-blog-core/src/templates/homepage-query"

export default HomepageComponent

export const query = graphql`
  query {
    allPost(sort: { fields: date, order: DESC }, limit: 3) {
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
