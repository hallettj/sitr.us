/** @jsx jsx */
import { Fragment } from "react"
import { jsx } from "theme-ui"
import { Revision } from "../models/revision"

export const Revisions = ({ revisions }: { revisions: Revision[] }) => {
  if (revisions.length < 1) {
    return null
  }
  return (
    <section
      className="revisions"
      sx={{
        fontSize: [1, 1, 2]
      }}
    >
      <header>
        <h2>Revision history</h2>
      </header>
      <dl>
        {revisions.map(({ date, message }) => (
          <Fragment key={date + message}>
            <dt sx={{ "font-weight": "bold", "::after": { content: '":"' } }}>
              {date}
            </dt>
            <dd dangerouslySetInnerHTML={{ __html: message ?? "" }} />
          </Fragment>
        ))}
      </dl>
    </section>
  )
}
