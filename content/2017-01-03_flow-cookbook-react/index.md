+++
title = "Flow Cookbook: Flow & React"
date = 2017-01-03
updated = 2017-11-22
path = "2017/01/03/flow-cookbook-react.html"

[taxonomies]
tags = ["Flow", "Flow Cookbook", "React"]
series = ["Flow Cookbook"]

[extra]
revisions = [
  { date = 2017-01-07, message = "The hacker news client library is now on npm - updated references accordingly" },
  { date = 2017-11-22, message = "Updates for Flow v0.53.0" },
]
+++

_This recipe is part of the [Flow Cookbook][] series._

[Flow Cookbook]: @/2016-12-20_flow-cookbook/index.md

Flow and React are both Facebook projects -
so as you might imagine, they work quite well together.
React components can take type parameters to specify types for props and state.
Type-checking works well with both [functional and class components][].

Flow type annotations provide an alternative to `propTypes` runtime checks.
Flow's static checking has some advantages:

- Problems are reported immediately - it is not necessary to run tests that
evaluate every component to identify `props` mismatches.
- Flow types can be more precise and concise than `propTypes`.
- Flow can also check `state` as well as `props`.
- In addition to checking that a component gets the correct `props`,
Flow checks that `props` and `states` are used correctly within the component's
`render` method,
and in other component methods.

<!-- more -->

Flow changed the way that it handles React types in [version 0.53.0][0.53.0].
This recipe assumes that you are using Flow v0.53.0 or later.

[0.53.0]: https://github.com/facebook/flow/blob/master/Changelog.md#0530

## How it works

With Flow you specify the types of `props` and `state` using type parameters on
the `React.Component` class.
The form for type parameters is:

```js
class MyComponent extends React.Component<Props, State> {
  /* ... */
}
```

Where `Props`, and `State` can be whatever object types you want.
If your component has the props `title`, `createdAt`, and `authorId`
then a definition for `Props` could look like this:

```js
type Props = {
  title: string,
  createdAt: Date,
  authorId: number,
}
```

If your component is stateless then you can omit the `State` parameter,
in which case the state type defaults to `void`.

`Props` should list types for *all* props -
even props that are optional or that have default values.
If you add a `defaultProps` value to your component then Flow will
automatically infer that fields from `defaultProps` are not required when your
component is called.
So you should not use a `?` in the corresponding field in your `Props` type.
Leaving out the `?` lets you avoid unnecessary `undefined` checks in your
component's methods.

```js
type Props = {
  updatedAt?: Date,      // optional prop, no default value
  commentsEnabled: bool, // optional, but has a default value in `defaultProps`
}

class MyComponent extends React.Component<Props> {
  static defaultProps = { commentsEnabled: true }

  /* ... */
}
```

To declare a type for `props` in a stateless functional component use
a type annotation like this:

```js
function MyComponent(props: Props) {
  /* ... */
}
```

Once again, `Props` can be any object type that you want,
and should include types for all props, even those that have default values.
The return type for a functional component is `React.Element<*>` -
but Flow can infer that so don't bother with a return type annotation.

Type definitions for React are built into Flow.
The Flow documentation includes a
[type reference for React types][type reference].
It is useful to look at those definitions to see exactly what Flow expects.
You can also go straight to the source:
a lot of what I know about using Flow came from examining
[Flow's type definition file for React][react lib]
and other files in the same directory.

The Flow documentation also includes its own guide on
[using Flow with React][official guide].


## A Hacker News client

Let's build on the code from the [Unpacking JSON API data][] recipe,
and build a simple Hacker News client.
The client will fetch lists of stories from the Hacker News API to display.
When the user selects a story,
the client will fetch and display comments.

Let's start with a component that displays a Hacker News story as a single line,
and accepts a callback to do something if the user selects that story.
First we define a type for the props that this component will accept.

{{ add_src_to_code_block(src="https://github.com/hallettj/flow-cookbook-react/blob/cc131b65c48d30dcadc80792843e05c8b8f05387/src/StoryListItem.js#L5") }}

```js
import { type Story } from 'flow-cookbook-hacker-news'

type StoryListItemProps = {
  story: Story,
  onSelect: () => void,
}
```

We import the `Story` type from `'flow-cookbook-hacker-news'`,
which is the example code from the [Unpacking JSON API data][] recipe.
That `Story` type is a ready-made type that describes everything we will want
to display in the new client.
Take a look at the [source file][Story] to see what `Story` looks like.
(The `import { type T }` bit is [Flow syntax][import syntax] -
it is not part of Javascript.)

The `StoryListItemProps` type lists the props that will be given to our
component.
The props are a `story`,
and a callback called `onSelect`.
The type indicates that `onSelect` must be a function that takes zero arguments,
and that returns `undefined` (a.k.a. `void`).
It is not necessary to require that the return type be `undefined` -
you could use `mixed` instead if you do not want to put any constraint on the
callback's return type.

My opinion is that using `void` is a clear indication to the caller that the
component will not do anything with a return value.
On the other hand you might get an irritating type error if you provide
a single-expression arrow function that implicitly returns a value.

And here is the `StoryListItem` component itself:

{{ add_src_to_code_block(src="https://github.com/hallettj/flow-cookbook-react/blob/cc131b65c48d30dcadc80792843e05c8b8f05387/src/StoryListItem.js#L12") }}

```js
function StoryListItem(props: StoryListItemProps) {
  const { by, title } = props.story
  return <p>
    <a href="#" onClick={event => selectStory(props, event)}>
      {title}
    </a> posted by {by}
  </p>
}

function selectStory(props: StoryListItemProps, event: Event) {
  event.preventDefault()
  props.onSelect()
}
```

The type annotation, `props: StoryListItemProps`,
does two things for us:
when `StoryListItem` is rendered, Flow will check that it is given the required
props of the appropriate types;
and Flow will also check uses of `props` in the body of the `StoryListItem`
function for consistency with `StoryListItemProps`.
Checking props from both directions ensures that a component is in alignment
with its callers.

In general if a component does not have internal state,
and does not use life cycle callbacks such as `componentDidMount`,
then I prefer to use a functional component, like `StoryListItem`.
A functional component cannot have methods that refer to `this.props`;
so I made the `selectStory` event handler a top-level function that accepts
a reference to the component's props as an argument.
Reusing the `StoryListItemProps` type in the signatures for the component and
for the event handler means that we can easily keep track of available props in
both functions.

`selectStory` also takes an `event` argument.
The `Event` type is built into Flow,
and Flow knows about the `preventDefault` method.
Flow's version of the `Event` type is defined in Flow's
[DOM type definitions file][].

To populate instances of the `StoryListItem` component,
we will need to make API requests and update some state.
Here is a type for that state,
and the parameters for the top-level component, which will manage that state:

{{ add_src_to_code_block(src="https://github.com/hallettj/flow-cookbook-react/blob/cc131b65c48d30dcadc80792843e05c8b8f05387/src/App.js#L11") }}

```js
type AppProps = {
  numStories: number,
}

type AppState = {
  selectedStory?: ?Story,
  stories?: Story[],
  error?: Error,
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    this.state = {}
  }

  /* ... */
}
```

The definition of `AppState` shows that the state will hold an array of `stories`,
which will not be defined while stories are loading;
a `selectedStory`,
which will be defined when the user is viewing comments on a story;
and an `error`,
in case something goes wrong while loading stories.

Because every property in `AppState` is optional,
`state` can be initialized as an empty object.
(The question mark at the end of a property name indicates that property might
not be set.)
`selectedStory` is optional, and its type is nullable,
so there are two question marks on that line.
That is because `selectedStory` is initially not set,
and after a user views a story and then backs out to the story list
`selectedStory` will be set to `null`.

Since `App` has a `constructor`,
we specify the props type both in the second class type parameter,
and again in the type of the `props` argument to `constructor`.
That is because a subclass can define a constructor with a signature that
differs from the parent class' constructor.
It would not make much sense to do that in a React Component;
but Flow must be able to check all sorts of classes,
so it does not make assumptions about types of constructor arguments.

`App` will fetch stories when it is mounted.
So we extend its definition with a `componentDidMount` callback.

{{ add_src_to_code_block(src="https://github.com/hallettj/flow-cookbook-react/blob/cc131b65c48d30dcadc80792843e05c8b8f05387/src/App.js#L27") }}

```js
import { fetchTopStories } from 'flow-cookbook-hacker-news'

class App extends React.Component<AppProps, AppState> {
  /* ... same as before */

  componentDidMount() {
    fetchTopStories(this.props.numStories /* number of stories to fetch */)
      .then(stories => {
        // On success, update component state with an array of stories
        this.setState({ stories })
      })
      .catch(error => {
        // On error, update state to capture the error for display
        this.setState({ error })
      })
  }

  /* ... */
}
```

`fetchTopStories` takes an argument that specifies the number of stories to
fetch,
and it returns a promise.

Once stories are loaded we can display them via a `render` method.
But the component will initially display while the API request is loading;
so we will have to check whether stories have loaded,
and display a loading indicator if they are not ready.

{{ add_src_to_code_block(src="https://github.com/hallettj/flow-cookbook-react/blob/cc131b65c48d30dcadc80792843e05c8b8f05387/src/App.js#L39") }}

```js
class App extends React.Component<AppProps, AppState> {
  /* ... */

  render() {
    const { error, selectedStory, stories } = this.state

    let content
    if (error) {
      // an error occurred fetching stories
      content = <p className="error">{error.message}</p>
    }
    else if (selectedStory) {
      // the user is looking at comments on a story
      content = <StoryView
        story={selectedStory}
        onNavigateBack={() => this.deselectStory()}
      />
    }
    else if (stories) {
      // stories are loaded, so display a line item for each story
      content = stories.map(story => (
        <StoryListItem
          story={story}
          onSelect={() => this.selectStory(story)}
          key={story.id}
        />
      ))
    }
    else {
      // no error and no stories means that stories are still loading
      content = <p className="loading">loading...</p>
    }

    return (
      <div className="App">
        <div className="App-header">
          <h1>Flow Cookbook: React Example</h1>
        </div>
        <div>
          {content}
        </div>
      </div>
  }

  /* ... */
}
```

The import piece of the JSX that is finally returned from `render` is `content`,
which is assigned a different value depending on whether an error occurred
while fetching stories,
a specific story has been selected,
or there is an array of stories available, and none has been selected.
If none of those cases applies,
then it means that stories are still loading.

When displaying a list of stories, `content` is populated by a list of
instances of `StoryListItem`,
which we defined earlier.
There is nothing special about rendering a type-checked component -
you pass props the same way as with any component.

Flow can track changes to the type of a variable over a series of statements.
Flow infers that when `content` is first defined its type is `void`;
and it infers that no matter which code path gets executed,
by the time we get to the `return` statement the type has changed to either
`React.Element<*>` or `React.Element<*>[]` -
either of which is compatible with Flow's expectations for JSX content.

The event handling methods `selectStory` and `deselectStory` make state changes
to track whether the user is looking at a specific story:

{{ add_src_to_code_block(src="https://github.com/hallettj/flow-cookbook-react/blob/cc131b65c48d30dcadc80792843e05c8b8f05387/src/App.js#L81") }}

```js
class App extends React.Component<AppProps, AppState> {
  /* ... */

  selectStory(story: Story) {
    this.setState({ selectedStory: story })
  }

  deselectStory() {
    this.setState({ selectedStory: null })
  }
}
```

Those state changes affect the output from `render` to switch between displaying
a list of story titles, or a detail view for a single story.

At this point
we have made references to `App`'s state in `componentDidMount`, `render`,
`selectStory`, and `deselectStory`.
Flow checks all of those uses against the definition of `AppState`.
For example, if we made a mistaken assumption that `selectedStory` holds an ID,
as opposed to a value of type `Story`,
and tried to write something like `this.setState({ selectedStory: story.id })`
Flow would report an error, and point out the mismatch.

I have not given the implementation of `StoryView`,
which is responsible for displaying comments on a story.
It happens that `StoryView` is quite similar to `App` -
except that `StoryView` loads comments where `App` loads stories.
The interested reader can see the full details of `StoryView` in the
[accompanying code][StoryView].

Complete working code is available at
[https://github.com/hallettj/flow-cookbook-react](https://github.com/hallettj/flow-cookbook-react).
Your next assignment is to clone that code and to add some features.
Some ideas to try are to add links to the original article for each story,
or to display profile pages for posters and commenters.

The example code here uses React's own state features to manage app state.
That helps to keep this recipe self-contained.
But in my opinion the best practice is to keep state in a third-party
state-management framework such as [Redux][].
For details on using Flow with Redux and [react-redux][]
take a look at the next recipe, [Flow & Redux][].


[functional and class components]: https://facebook.github.io/react/docs/components-and-props.html#functional-and-class-components
[Unpacking JSON API data]: /2016/12/20/flow-cookbook-unpacking-json.html
[type reference]: https://flow.org/en/docs/react/types/
[react lib]: https://github.com/facebook/flow/blob/master/lib/react.js
[official guide]: https://flow.org/en/docs/react/
[Story]: https://github.com/hallettj/flow-cookbook-hacker-news/blob/master/index.js.flow#L9
[import syntax]: https://flowtype.org/docs/syntax.html#importing-and-exporting-types
[DOM type definitions file]: https://github.com/facebook/flow/blob/master/lib/dom.js#L210
[StoryView]: https://github.com/hallettj/flow-cookbook-react/blob/master/src/StoryView.js
[Redux]: http://redux.js.org/
[react-redux]: http://redux.js.org/docs/basics/UsageWithReact.html
[Flow & Redux]: /todo.html

{{ revisions() }}
