/** @jsx jsx */
import Slugger from "github-slugger"
import dropWhile from "lodash/dropWhile"
import takeWhile from "lodash/takeWhile"
import { jsx, Styled } from "theme-ui"

type Headings = Array<{ depth: number; value: string }>

const ContentsHeading = ({ heading }: { heading: NestedHeadings }) => {
  if ("depth" in heading) {
    return (
      <Styled.li>
        <Styled.a href={`#${heading.slug}`}>{heading.value}</Styled.a>
      </Styled.li>
    )
  }
  return (
    <Styled.ul>
      {heading.map(nested => (
        <ContentsHeading key={slugFor(nested)} heading={nested} />
      ))}
    </Styled.ul>
  )
}

export const TableOfContents = ({
  headings,
  skip
}: {
  headings: Headings
  skip?: Array<string | RegExp>
}) => {
  return <ContentsHeading heading={processedHeadings(headings, skip)} />
}

function processedHeadings(
  headings: Headings,
  skip: Array<string | RegExp> = [/table of contents/i]
): NestedHeadings {
  const slugger = new Slugger()
  return nestedHeadings(
    headings
      .map(({ depth, value }) => ({
        depth,
        value,
        slug: slugger.slug(value)
      }))
      .filter(
        ({ value }) =>
          !skip.some(rule =>
            typeof rule === "string" ? value === rule : rule.exec(value)
          )
      )
  )
}

type HeadingWithSlug = { depth: number; value: string; slug: string }

type NestedHeadings = HeadingWithSlug | NestedHeadings[]

function nestedHeadings(
  headings: HeadingWithSlug[],
  currentDepth: number = minDepth(headings)
): NestedHeadings {
  const [topLevel, rest1] = splitBy(
    headings,
    ({ depth }) => depth === currentDepth
  )
  const [nested, rest2] = splitBy(rest1, ({ depth }) => depth > currentDepth)
  return (topLevel as NestedHeadings[])
    .concat(nested.length > 0 ? [nestedHeadings(nested, currentDepth + 1)] : [])
    .concat(rest2.length > 0 ? nestedHeadings(rest2, currentDepth) : [])
}

function slugFor(heading: NestedHeadings): string {
  if ("slug" in heading) {
    return heading.slug
  }
  return slugFor(heading[0])
}

function minDepth(headings: Headings): number {
  return headings.reduce((min, { depth }) => Math.min(min, depth), Infinity)
}

function splitBy<T>(xs: T[], pred: (x: T) => boolean): [T[], T[]] {
  return [takeWhile(xs, pred), dropWhile(xs, pred)]
}
