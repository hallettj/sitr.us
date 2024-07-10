+++
title = "Advanced features in Flow"
date = 2015-05-31
updated = 2015-06-08
path = "2015/05/31/advanced-features-in-flow.html"

[taxonomies]
tags = ["Flow"]

[extra]
toc_ignore_pattern = "Table of Contents"
revisions = [
  { date = 2015-06-01, message = "Added notice that `$` features are not public." },
  { date = 2015-06-08, message = "`$Record<T>` is gone in Flow v0.12." },
]
+++

Flow has some very interesting features that are currently not documented.
It is likely that the reason for missing documentation is that these features
are still experimental.
_Caveat emptor_.

I took a stroll through the source code for Flow v0.11.
Here is what I found while reading [type_inference_js.ml][inference]
and [react.js][react-types].

[inference]: https://github.com/facebook/flow/blob/master/src/typing/type_inference_js.ml#L612
[react-types]: https://github.com/facebook/flow/blob/master/lib/react.js

<!-- more -->

*Edit*: It has been pointed out to me that Flow features prefixed with `$` are not technically public,
and that the semantics of those features may change.
But they are useful enough that I plan to use some of them anyway :)

## Table of Contents

<!-- toc -->

## `Class<T>`

Type of the class whose instances are of type `T`.
This lets you pass around classes as first-class values -
with proper type checking.

I use this in an event dispatch system where events are class instances,
and event handlers are invoked based on whether they accept a given event type:

```js
var handlers: Array<[Class<any>, Function]> = []

function register<T:Object>(klass: Class<T>, handler: (event: T) => void) {
  handlers.push([klass, handler])
}

function emit<T:Object>(event: T) {
  handlers.forEach(([klass, handler]) => {
    if (event instanceof klass) {
      handler(event)
    }
  })
}
```

This gives me a compile-time guarantee that event handlers can handle events of
the type they are invoked with.

```js
class ViewPost {
  id: number;
  author: string;
  constructor(id: number, author: string) {
    this.id = id
    this.author = author
  }
}

class ViewComment {
  id: number;
  postId: number;
  constructor(id: number, postId: number) {
    this.id = id
    this.postId = postId
  }
}

// No errors!
register(ViewPost, ({ id, author }) => { /* whatever */ })

// Error: object pattern property not found in ViewComment
register(ViewComment, ({ id, author }) => { /* whatever */ })
```

## `$Diff<A,B>`

If `A` and `B` are object types,
`$Diff<A,B>` is the type of objects that have properties defined in `A`, but not in `B`.
Properties that are defined in both `A` and `B` are allowed too.

React uses this to throw type errors if components are not given required props,
but to leave props with default values as optional.

```js
declare function createElement<D, P, S, A: $Diff<P, D>>(
  name: ReactClass<D, P, S>,
  attributes: A,
  children?: any
): ReactElement<D, P, S>;
```

Where `P` is the type for component props,
and `D` is the type for default props.

Here is a simplified example:

```js
type Props = {
  foo: number,
  bar: string,
}

type DefaultProps = {
  foo: number,
}

function setProps<T: $Diff<Props, DefaultProps>>(props: T) {
  // whatever
}

// No errors!
setProps({
  bar: 'two',
})

// No errors!
setProps({
  foo: 1,
  bar: 'two',
})

// Error, because `bar` is required
setProps({
    foo: 1,
})
```

In my testing,
this worked equally well if `$Diff` was used directly in the type of `P`
instead of as a type bound.
But in the React type declarations,
it is used in a type bound.

## `$Shape<T>`

Matches the shape of `T`.
React uses `$Shape` in the signatures for `setProps` and `setState`.

```js
declare class ReactComponent<D, P, S> {
  // ...

  setProps(props: $Shape<P>, callback?: () => void): void;
  setState(state: $Shape<S>, callback?: () => void): void;

  replaceProps(props: P, callback?: () => void): void;
  replaceState(state: S, callback?: () => void): void;

  // ...
}
```

Where `P` is the type of a component's props,
and `S` is the type of a component's state.

An object of type `$Shape<T>` does not have to have all of the properties that
type `T` defines.
But the types of the properties that it does have must match the types of the
same properties in `T`.

In React this means that you can use, e.g., `setState` to set some state
properties, while leaving others unspecified.
Note how the type of `state` in `replaceState` differs:
when calling `replaceState` you must include a value for every property in `S`.

Some examples:

```js
type Props = {
  foo: number,
  bar: string,
}

// No errors!
var a: $Shape<Props> = {
  foo: 1
}

// Error: string is incompatible with type number
var b: $Shape<Props> = {
  foo: 'one'
}
```

An object of type `$Shape<T>` is not allowed to have properties that are not
part of `T`.

```js
// Error: prop baz of Props not found in object type
var c: $Shape<Props> = {
  foo: 1,
  baz: 2,
}
```

`$Shape` is like a supertype for objects.
Consider that a type `{ foo: number }` (when used as a type bound) represents
all objects that have a `foo` property of type `number`.
That includes objects that have additional properties, such as
`{ foo: 1, bar: 'string' }`.
So `{ foo: number }` is a supertype of, e.g., `{ foo: number, bar: string }`.
The type `$Shape<{ foo: number, bar: string }>` allows values of type
`{ foo: number }`.
That is to say, `$Shape<T>` refers to types that are more general than `T` -
i.e., supertypes.

## `$Record<T>`

*Update:* `$Record<T>` is [gone in Flow v0.12][nuke-record].
But instead of `$Record<T>`,
you can use the nearly equivalent construct: `{[key: $Enum<T>]: U}`,
where `U` is the type of values in the record.

[nuke-record]: https://github.com/facebook/flow/commit/6d4447b0300494f8a235f4d0907bee438705ba19

The type of objects whose keys are those of `T`.
This means that an object of type `$Record<T>` must have properties with all of
the same names as the properties in `T` -
but the types assigned to those properties may be different.

React uses `$Record` to check the type of `propTypes`.
Here is a simplified example:


```js
type Props = {
  foo: number,
  bar: string,
}

var propTypes1: $Record<Props> = {
  foo: React.PropTypes.number,
  bar: React.PropTypes.string,
}

// Error: string literal bar property not found in object literal
var propTypes2: $Record<Props> = {
  foo: React.PropTypes.number,
}
```

Note that Flow does *not* verify that `React.PropTypes.number` matches the type
`number`.
It just checks that `propTypes1` has all of the same keys.

```js
// No errors!
var propTypes3: $Record<Props> = {
  foo: 'bleah',
  bar: 'blerg',
}
```

A `$Record` type might have additional keys that are not included in the
original object type.

```js
// No errors!
var propTypes4: $Record<Props> = {
  foo: React.PropTypes.number,
  bar: React.PropTypes.string,
  baz: React.PropTypes.string,
}
```

An important detail to note is that a `$Record` type can only use property
names that are known statically.
Dynamic lookups are not allowed.

```js
propTypes4.foo  // No errors!

// Error: computed property/element cannot be accessed on record type
propTypes4['foo']
```

In its real definition,
React actually uses `$Record` in combination with `$Supertype` so that you do
not get an error if you omit some properties from `propTypes`.

## `$Supertype<T>`

A type that is a supertype of `T`.
React uses `$Supertype` in the type of `propTypes`:

```js
declare class ReactComponent<D, P, S> {
  // ...

  static propTypes: $Supertype<$Record<P>>;

  // ...
}
```

Where the type variable `P` is the type of the props for a component.

It looks like the intent is to check that if a component defines `propTypes`,
all of the properties listed are also in the type of `props`.
But it should not report an error if `propTypes` excludes some props.
I could not get a type error when testing this.
It could  be that interaction between `$Supertype` and object types is still
a work in progress.

If you are thinking of using `$Supertype` with an object type,
consider `$Shape` -
it might be a better choice.

## `$Subtype<T>`

A type that is a subtype of `T`.
This is what you get when you use a type bound.
For example,
these signatures are equivalent:

```js
function doSomething1<T: Object>(obj: T) { /* whatever */ }

function doSomething2(obj: $Subtype<Object>) { /* whatever */ }
```

But the second version has the disadvantage that you cannot refer to the type
that `obj` gets in the return type of the function, or in the types of other
arguments.

While trying to come up with example cases for `$Subtype`,
I came across other nice improvements to Flow that render `$Subtype`
unnecessary in a lot of cases.
In a previous version of Flow,
I recall (possibly incorrectly) having to use a type bound in a function that
takes on object with
certain required properties,
where you don't want to prevent the caller from including additional properties.
But now this works without a type bound:

```js
function getId(obj: { id: number }): number {
  return obj.id
}

getId({ id: 1, name: 'foo' })  // No errors!
```

I also had a thought that `$Subtype` could be used to implement a composition
pattern that previously did not work.

```js
type HasId = { id: number }
type HasName = { name: string }

type Widget = HasId & HasName

function makeWidget(id: number, name: string): Widget {
  return { id, name }
}

var w = makeWidget(1, 'foo')
```

But in Flow v0.11 this does work.
Hooray!

`$Subtype` could be useful if you want to define an object type that can be
assigned properties that are not declared in the type:

```js
type Extensible = $Subtype<{foo: number}>

var a: Extensible = { foo: 1, bar: 2 }

a.baz = 3  // No errors!

// Error: property foo not found in object literal
var b: Extensible = { bar: 2 }
```

However this weakens property checking on the extensible type.
For example,
Flow does not infer that the type of `a.foo` must be `number`.
(It checks the type of `foo` correctly when the object is first created,
but not on reads or reassignment).

## `$Enum<T>`

The set of keys of `T`.
One use for this is to write a lookup function,
and have Flow check that the lookup key is valid.

```js
var props = {
  foo: 1,
  bar: 'two',
  baz: 'three',
}

function getProp<T>(key: $Enum<typeof props>): T {
  return props[key]
}

getProp('foo')  // No errors!

// Error: string literal nao property not found in object literal
getProp('nao')
```

The type `$Enum<typeof props>` is a lot like this type:

```js
type EnumProps = 'foo' | 'bar' | 'baz'
```

But with `$Enum`,
Flow computes the type union for you.

Flow's tests include [more][enumerror] [examples][enum_client].

[enumerror]: https://github.com/facebook/flow/blob/master/tests/enumerror/enumerror.js
[enum_client]: https://github.com/facebook/flow/blob/master/tests/literal/enum_client.js

## Existential types

Flow supports an "existential type": `*`.
When `*` is given as a type,
it acts as a placeholder,
leaving it to the type checker to infer the type for that position.

Let's generalize the `getProp` function from the section above.
Let's write a function that takes any object and returns a getter.
The getter can be used to get arbitrary properties out of the object,
without having to refer to the object itself after creating the getter.
We would like to write this:

```js
// Does not work!
function makeGetter<T:Object>(obj: T): <U>(key: $Enum<T>) => U {
  return function(key) {
    return obj[key]
  }
}
```

The use of `$Enum<T>` ensures that a getter can only be called to get
properties that actually exist on the given object.

But Flow objects to the lack of type declarations in the inner function.
It reports an error:

    function type is incompatible with polymorphic type: function type

An obvious idea is to copy types from the return type of `makeGetter` into the
signature of the inner function.
But that leads to another problem.

```js
// Still does not work!
function makeGetter<T:Object>(obj: T): <U>(key: $Enum<T>) => U {
  return function<U>(key: $Enum<T>): U {
    return obj[key]
  }
}
```

This time the error is:

    identifier T, Could not resolve name

The problem is that type variables in a function signature
(in this case, in the signature of `makeGetter`)
are not in scope in the function body.
So we cannot refer to the type `T` in inner function types,
or in variable types in the body of `makeGetter`.

On the other hand, Flow might be smart enough to figure out what the argument
type in the inner function should be.
So we can use `*` to kick the problem over to Flow.

```js
// Finally, an version that does work.
function makeGetter<T:Object>(obj: T): <U>(key: $Enum<T>) => U {
  return function <U>(key: *): U {
    return obj[key]
  }
}
```

Now we can see `makeGetter` in action.

```js
var someObj = { foo: 1, bar: 2 }
var get = makeGetter(someObj)

get('foo')  // No errors!

get('baz')  // string literal 'baz' not found in object literal
```

Another option would have been to use `any` instead of `*`.
But that is so much less elegant!
The important difference is that where `*` appears,
Flow will fill in a specific type,
which could lead to accurate type checking in other areas of the code where the
value of type `*` appears.
If you annotate a value with `any`,
Flow will not attempt to type-check expressions where that value appears -
which could lead to type errors being missed.

In this case the choice of `*` versus `any` does not matter,
since the outer function has the type signature that we want.

React uses an existential type to define the `ReactClass` type:

```js
/**
 * Type of a React class (not to be confused with the type of instances of a
 * React class, which is the React class itself). A React class is any subclass
 * of ReactComponent. We make the type of a React class polymorphic over the
 * same type parameters (D, P, S) as ReactComponent. The required constraints
 * are set up using a "helper" type alias, that takes an additional type
 * parameter C representing the React class, which is then abstracted with an
 * existential type (*). The * can be thought of as an "auto" instruction to the
 * typechecker, telling it to fill in the type from context.
 */
type ReactClass<D, P, S> = _ReactClass<D, P, S, *>;
type _ReactClass<D, P, S, C: ReactComponent<D, P, S>> = Class<C>;
```

This allows React to pass around a polymorphic class as a first-class value
without losing type information.

## Scoped type variables in classes

I mentioned in the last section that type variables in a function's signature
are not in scope in the body of that function.
I find it interesting that classes do not have this restriction:
type variables in a class declaration *are* in scope in the class definition.
(They are not in scope within method bodies; but you can use these variables in method signatures and class variable types).
Because of this,
there are some problems that do not exactly work with functions but that do
work with classes.

We can reimplement `makeGetter` from the last section as a class.

```js
class Getter<T:Object> {
  obj: T;
  constructor(obj: T) { this.obj = obj }
  getProp<U>(key: $Enum<T>): U {
    return this.obj[key]
  }
}

var someObj = { foo: 1, bar: 2 }
var getter = new Getter(someObj)

getter.getProp('foo')  // No errors!

// Error: string literal 'baz' not found in object literal
getter.getProp('baz')
```

This probably seems unremarkable -
every object-oriented language with static type-checking scopes class-level
type variables this way.
But ES6 classes are mostly syntactic sugar for ES5 constructor functions -
yet a straight translation of `Getter` to ES5 syntax does not work:

```js
// Does not work
function Getter<T:Object>(obj: T) {
  this.getProp = function<U>(key: $Enum<T>): U {
    return obj[key]
  }
}
```

We get the same error: `identifier T, could not resolve name`.
This time to fix the problem we have to refer to `T` indirectly using `typeof obj`.

```js
// No errors!
function Getter<T:Object>(obj: T) {
  this.getProp = function<U>(key: $Enum<typeof obj>): U {
    return obj[key]
  }
}
```

The ability of classes to scope type variables over inner methods,
and the ability to use `instanceof` for type refinement,
lead me to use classes more often than I would if I were not using Flow.

{{ revisions() }}
