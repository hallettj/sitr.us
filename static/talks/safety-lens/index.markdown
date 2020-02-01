% safety-lens
% Jesse Hallett
% PDXjs, February 24 2016


~~~~ {.javascript}
import 'date-utils'

let event = { date: new Date(), title: 'get coffee' }

event.date = new Date().addDays(1)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import 'date-utils'

let event = { date: new Date(), title: 'get coffee' }

event = Object.assign({}, event, { date: new Date().addDays(1) })
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import { set } from 'safety-lens'
import { prop } from 'safety-lens/es2015'

event = set(prop('date'), new Date().addDays(1), event)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import { get, over } from 'safety-lens'

const date = get(prop('date'), event)

event = over(prop('date'), d => d.addDays(1), event)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import type { Lens_ } from 'safety-lens'

type Event = { date: Date, title: string }
const eventDate: Lens_<Event, Date>

event = over(eventDate, date => date.addDays(1), event)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import { List, Map } from 'immutable'
import { lookup } from 'safety-lens'

let events = List.of(
  Map({ date: new Date(), title: 'get coffee' }),
  Map({ date: new Date(), title: 'plan day' })
)

let firstEventDate = events.getIn([0, 'date'])
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import { lookup } from 'safety-lens'

events = List.of(
  { date: new Date(), title: 'get coffee' },
  { date: new Date(), title: 'plan day' }
)

const firstEvent = index(0)
const firstEventDate = compose(firstEvent, eventDate)

firstEventDate = lookup(firstEventDate, events)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
import { traverse } from 'safety-lens/immutable'

const allDates = compose(traverse, eventDate)

const rescheduled = over(
  allDates,
  date => date.addDays(1),
  events
)
~~~~~~~~~~~~~~~~~~~~~~

---

github.com/hallettj/safety-lens

~~~~ {.sh}
npm install safety-lens
~~~~~~~~~~~~~~~~~~~~~~
