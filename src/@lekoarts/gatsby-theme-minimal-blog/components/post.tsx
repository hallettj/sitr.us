/** @jsx jsx */
import { jsx, Styled } from "theme-ui"
import { MDXRenderer } from "gatsby-plugin-mdx"
import React from "react"
import Layout from "@lekoarts/gatsby-theme-minimal-blog/src/components/layout"
import ItemTags from "@lekoarts/gatsby-theme-minimal-blog/src/components/item-tags"
import SEO from "@lekoarts/gatsby-theme-minimal-blog/src/components/seo"
import { Revisions } from "../../../components/revisions"
import { sortedRevisions } from "../../../models/revision"

type PostProps = {
  data: {
    post: {
      slug: string
      title: string
      date: string
      tags?: {
        name: string
        slug: string
      }[]
      description?: string
      body: string
      excerpt: string
      timeToRead: number
      banner?: {
        childImageSharp: {
          resize: {
            src: string
          }
        }
      }
    }
    mdx: {
      frontmatter: {
        revisions?: Array<{ date: string; message: string }>
      }
      headings: {
        depth: number
        value: string
      }
    }
  }
}

const px = [`32px`, `16px`, `8px`, `4px`]
const shadow = px.map(v => `rgba(0, 0, 0, 0.15) 0px ${v} ${v} 0px`)

const Post = ({
  data: {
    post,
    mdx: { frontmatter, headings }
  }
}: PostProps) => {
  const revisions = sortedRevisions(frontmatter.revisions)
  const updated = revisions && revisions[0]?.date
  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.description ? post.description : post.excerpt}
        image={post.banner ? post.banner.childImageSharp.resize.src : undefined}
      />
      <Styled.h2>{post.title}</Styled.h2>
      <p
        sx={{
          color: `secondary`,
          mt: 3,
          a: { color: `secondary` },
          fontSize: [1, 1, 2]
        }}
      >
        {updated ? (
          <>
            Updated {updated} (originally posted{" "}
            <time dateTime={post.date}>{post.date}</time>)
          </>
        ) : (
          <time dateTime={post.date}>{post.date}</time>
        )}
        {post.tags && (
          <React.Fragment>
            {` — `}
            <ItemTags tags={post.tags} />
          </React.Fragment>
        )}
        {` — `}
        <span>{post.timeToRead} min read</span>
      </p>
      <section
        sx={{
          my: 5,
          ".gatsby-resp-image-wrapper": {
            my: [4, 4, 5],
            boxShadow: shadow.join(`, `)
          }
        }}
      >
        <MDXRenderer headings={headings}>{post.body}</MDXRenderer>
        <footer>
          <Revisions revisions={revisions} />
        </footer>
      </section>
    </Layout>
  )
}

export default Post
