+++
title = "The 6 Big Ideas of Typescript"
date = 2026-03-18
path = "2026/03/18/big-ideas-of-typescript.html"

[taxonomies]
tags = ["TypeScript", "type theory"]

[extra]
toc_ignore_pattern = "Table of Contents"
toc_levels = 2
+++

If you want to get a quick handle on what Typescript is all about,
and you have experience with other programming languages,
this post will give you a high-level overview of what is special about Typescript.
Typescript's take on type checking is unusually expressive compared to
similarly popular type-checked languages.
That's because Javascript, being a dynamically typed language, is extremely
flexible.
Typescript is designed to let you write Javascript as freely as you normally
would,
but with great type-checking added on.
Whether or not you have experience with type-checking in other languages,
it is helpful to learn the particulars of the Typescript way.

<!-- more -->

This is not a complete guide - I recommend following up on this primer by
reading [The Typescript Handbook][], and [Effective Typescript][].
I'm focusing on what makes Typescript different from Javascript -
which is the type-checking part.
So I'm not going to get into special Javascript features, like async/await.

[the typescript handbook]: https://www.typescriptlang.org/docs/handbook/intro.html
[effective typescript]: https://effectivetypescript.com/

## Table of Contents

<!-- toc -->

## 0. Types are the language that you use to talk to the compiler

Strongly-typed programming is a conversation between the programmer and the
compiler where you use types to make sure that you understand each other
correctly.
The programmer speaks through type annotations in code;
the compiler speaks through error messages, completion suggestions, and quick
fixes.
When the compiler understands what you mean it can help you to get to
the code that you want.

It's an exchange that matches your mental picture of your code with what
is actually written. Types get you and your compiler on the same page.
The conversation also helps you to reflect on your design to understand your own
ideas better.
When you write code you have in mind ideas about what kind of values can be
assigned to certain variables, or passed to certain functions.
That is true with or without type checking.
You always have some kind of mental model of what the data flowing through your
program looks like.
Types make that mental model explicit in code.
You describe to the compiler what types of data may or may not show up by
adding **type annotations** to variable declarations, function parameters, and
function return positions.

```ts
let i: number
//   ╰──┬───╯
// Values assigned to `i` should always be numbers - if I try to assign
// a non-number to `i` later then that was a mistake.

const sum = (x: number, y: number): number => x + y
//            ╰──┬───╯   ╰──┬───╯ ╰──┬───╯
//   x must be a number     │        │
//                          │        │
//                    same for y     │
//                                   │
//                        the function returns a number
//
// If I call the function `sum` with non-numbers it was a mistake, so please
// show me an error. Assuming that `x` and `y` are numbers if I write the
// implementation for `sum` so that it returns something other than a number
// then that must have been a mistake.
```

In my mind type checking revolves around function signatures.
When running Typescript in strict mode type annotations are usually required for
parameters of named functions,
but annotations for variables and function return types are optional.
This is because if Typescript knows the types for every function parameter it
can usually figure out the correct types for variables, and the return type for
each function using flow-based type inference.
At that point Typescript knows the rules for the entire flow of your program.

{% tip() %}
Types are also useful for communicating with other programmers! Type expressions
communicate important information concisely, and they don't go out of date the
way that code comments do.
{% end %}

The more that Typescript understands about your code the more it can help you.
I find that I get most value from Typescript when I use a functional programming
(FP) style.
FP encourages minimizing side-effects.
Instead you try to write functions that are only used for their return values.
That is helpful because observable behavior can then be described by function
signatures.

{% info() %}
Some languages can encode side-effects in function signatures.
But Typescript doesn't do this.
Try to limit side-effects to places where you really need them so that as much
of your program design as possible is communicated in function signatures.
See [Type-Driven Development with
TypeScript](@/2018-02-12_type-driven-development-with-typescript/index.md).
{% end %}

Types are ideas that are used at **design time** (the time when the type checker
runs, before your program is compiled to Javascript). During compilation types
are **erased** so you can't do anything with them at runtime.
Or put another way, once the code is compiled the conversation between the
programmer and the compiler is complete, and you don't need the types anymore.
It's sort of like how code comments don't affect how your program runs -
types don't affect the runtime either.[^optimization]
The difference is that only humans can read comments,
but the Typescript compiler can read and understand types.

[^optimization]:
    In many compiled languages the compiler can use what it learns
    from types not just to flag potential errors, but also to optimize to compiled
    output. In these cases types do have a certain effect on runtime behavior.
    Unfortunately Typescript does not do type-based optimization.

## 1. Typescript is Javascript with types

Typescript is a strongly-typed language that compiles to Javascript.
The compilation process consists of little more than deleting type expressions
from the code. (That includes type annotations, and type-level declarations like
interfaces and type aliases.)
This is almost exactly what happens if you choose to compile Typescript sources
using [Babel][] or [SWC][] instead of Typescript's own compiler.
What I'm saying is that Typescript is Javascript
with some type stuff sprinkled on it.
Yes, the Typescript compiler might substantially rewrite code for compatibility
if you configure it to target certain browser or Node versions -
but that is an extra feature, not a necessary part of Typescript-to-Javascript
compilation.
And yes, Typescript does add a handful of features that don't exist in
Javascript, like enums.
But if you write Javascript, and add type stuff as necessary then you will be on
the right track.

[babel]: https://babeljs.io/docs/en/babel-preset-typescript
[swc]: https://swc.rs/

{% warning() %}
Always run Typescript with the `strict` compiler option if you can! Most
material you read (including this primer) assumes that [strict][] mode is
enabled.

[strict]: https://www.typescriptlang.org/tsconfig#strict
{% end %}

If you have been writing Javascript you will need to make some changes to
accommodate Typescript's style.
But the design decisions that make Typescript unique were made specifically so
that Typescript's types mesh well with idiomatic Javascript -
so you won't need to make huge changes.
Features like structural types, and union and intersection operators allow types
to describe Javascript's dynamic style.

## 2. Types are sets of possible values

Some strongly-typed languages train programmers to think that types are classes.
But when you break the concept of a "type" down to its core idea, a type is
a set of possible values. For example a variable with the type `string` could
be assigned the value "hello, world!", "hunter2", or any other string.
Typescript takes a purist approach to types by directly providing union and
intersection set operations. Unlike in many languages, Typescript allows you to
build up larger types (sets with more possible values, a.k.a. supertypes) from
smaller types using the union operator.
You can also define types as the overlap of values from some existing types
using the intersection operator.
You can describe unit types which are so specific that they only contain one
possible value,
and there is even a type for the empty set (`never`).

Imagine you are implementing a function with this signature:

```ts
function log(message: string, logLevel: string) {
  /* ... */
}
```

To implement `log` you will need to have an idea what values might be bound to
`message` and to `logLevel`. According to the type annotations both are
strings - and Typescript will enforce that - so either variable could be any
member of the set of all possible strings.

### Unit types

Maybe that is too broad for your use case. Let's say that `logLevel` should
always have one of three values: `"info"`, `"warn"`, or `"error"`.
To understand how to describe that case let's first consider a type signature
that only allows one possible value:

```ts
function error(message: string, logLevel: "error") {
  //                                      ╰──┬──╯
  //                       This is a type expression.
  /* ... */
}
```

The expression after each colon (`:`) is a **type expression** meaning that in
that signature `"error"` is a type, not a value.
The _type_ `"error"` is a set with exactly one possible value,
which is the _value_ `"error"`.
The difference is that the type is exclusively part of your conversation with
the compiler, while the value represents bytes in memory in your running
program.

{% info() %}
In type theory any type that represents exactly one possible value is called
a **unit type**. In Typescript they are often called singleton types, or literal
types.
{% end %}

Because the type of `logLevel` is a string literal type, Typescript will only
allow `error` to be called with the string `"error"` as the second argument.
No, that's not very useful; but it helps to set up the next idea.

### Union types

Getting back to the idea of limiting `logLevel` to one of three possible values,
you can change the signature for `log` to look like this:

```ts
function log(message: string, logLevel: "info" | "warn" | "error") {
  //                                    ╰───────────┬───────────╯
  //                                  This is a union of three types.
  /* ... */
}
```

Each of `"info"`, `"warn"`, and `"error"` is a set with one value. When you take
the union of those three types using the `|` operator you get a set that
contains three possible values.
Unions of types are exactly like unions of sets in [set theory][]:
the output type contains all of the possible values from all of the input types.
Now Typescript will check that `log` is only called with one of those three
strings for the `logLevel` argument.

[set theory]: https://brilliant.org/wiki/sets-union-and-intersection-easy/

{% info() %}
Other languages support types that are defined as unions of other types. One
example is Rust `enum` types. But Rust `enum`s are "tagged" by constructors.
Typescript's unions are unusual in that they are "untagged".
{% end %}

### Nullable types

Typescript uses the concept of unions to express nullable types. Here `a` is
nullable, and `b` is not:

```ts
function foo(a: string | null, b: string) {
  //            ╰─────┬─────╯     ╰─┬──╯
  //           nullable string      │
  //                                │
  //                     non-nullable string
  /* ... */
}
```

Again, the `null` in that signature appears in a type expression meaning that it
references the _type_ `null`. Like with string literal types, the type `null` is
a set with one member, which is the value `null`. There is a similar
`undefined` type which also has one member.[^void]

[^void]:
    There is also a type called `void` that you often see used as a return
    type. It contains the value `undefined` because in Javascript functions with
    no explicit return value actually return `undefined`. But `void` is not
    exactly the same as the `undefined` type, and [is not a unit type][].

[is not a unit type]: /2021/12/04/void-is-not-a-unit-type.html

So the type expression `string | null` is a set that contains all possible
string values, and also contains the `null` value.

### Type intersections

Type intersections don't come up as often as unions, but they do have uses.
An intersection (using the `&` operator) produces a type that includes only the
possible values that are contained in every input type.

One common use case is where you have a predefined object type,
and you want a new type that adds properties to the existing type:

```ts
// Defines an object type that has all of the same properties the `Error` type
// does, *and* also has the property `code`.
type ErrorWithCode = Error & { code: number }
```

There are many possible objects that have the properties required by the
[Error][] class (`name`, `message`, and optionally `stack`).
Because types are structural in Typescript this set includes objects that have
other properties in addition to those required by the `Error` type.
There are also many possible objects that have a `code` property (and possibly
other properties).
There is an intersection between those two sets which is the set of possible
objects that have all of the above properties.
The type `ErrorWithCode` describes that set.

[error]: https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/error


{% info() %}
Typescript implements subtyping. Because a union type is a bigger set than the
possible values of its member types individually, a union type is
a **supertype** of each its members. On the other hand an intersection type is
a **subtype** of each of its members.
{% end %}

I have a more detailed look at types as sets in
[When to use `never` and `unknown` in Typescript](/2019/01/29/never-and-unknown-in-typescript.html/).

## 3. Types are structural

Javascript is "[duck typed][]": code that operates on an object will work with
any object that has the appropriate set of properties.
Typescript is designed to work with existing Javascript idioms so it supports
the same idea.
But unlike Javascript, Typescript checks at design time that a given object
argument has the appropriate properties with the appropriate types;
so instead of saying that Typescript is "duck typed", we say that it is
"structurally typed".
For example,

```ts
// Add up `length` properties of all input array elements.
function totalLength(xs: Array<{ length: number }>) {
  // We only know one thing about `x`: it has a numeric `length` property.
  // That's all we need!
  return xs.reduce((total, x) => total + x.length, 0)
}

// It works on arrays of strings because strings have a `length` property.
totalLength(["foo", "bar"])

// It works on arrays of arrays because arrays have a `length` property.
totalLength([
  [1, 2],
  [3, 4],
])

// It works on arrays with a mixture of strings and arrays.
totalLength(["foo", "bar", [1, 2], [3, 4]])
```

`totalLength` uses a type, `{ length: number }` to describe the type of array
elements for its input.
Thinking about types as sets of possible values,
that type is the set of all possible objects that have a property named `length`
where the type of that property is `number`.
Those objects could have other properties -
from the example we can see that strings and arrays count as members of that
type, and they have many properties besides `length`.
A value assigned to the variable `x` in `totalLength` could be one of many
different types of objects.
Because the specific type of `x` is `{ length: number }` the only property we
can access on `x` is `length`.

As I said, all of this is checked at design time.
The type checker will reject `totalLength([3])` because numbers do not have
a `length` property, and will reject `totalLength(3)` because `3` is not an
array.

{% warning() %}
Don't make assumptions about what is not described! An important consequence of
structural typing is that you can't make assumptions about object properties
that are not specifically listed in a variable's type. Even though the type of
`x` only lists one property, we can't assume that if we iterate over the
properties of `x` we will only get `length` because x can, and does, have other
properties. If you want to iterate over the properties of an object you have to
have some way of knowing beyond the type system what kind of properties you will
get.
{% end %}

[duck typed]: https://devopedia.org/duck-typing

### Gotcha: excess property checking

Typescript has a special feature called excess property checking that will
from time to time cause you to question your understanding of structural typing.
It is a useful feature once you understand it, and remember that, oh yeah,
that's a thing.
Based on what you've read so far you might be surprised by the type error in
this code:

```ts
// Update a previously-saved record. A previously-saved record always has an
// `id` property.
async function updateRecord(record: { id: number }) {
  /* ... */
}

// Type error: Argument of type '{ id: number; name: string; }' is not
// assignable to parameter of type '{ id: number; }'. Object literal may only
// specify known properties, and 'name' does not exist in type '{ id: number;
// }'.
updateRecord({ id: 1, name: "Jesse" })
```

Despite the error message, `updateRecord` will accept an argument with a `name`
property.
The code works fine if we change it to assign the argument to an intermediate
variable:

```ts
const record = { id: 1, name: "Jesse" }

// This is fine!
updateRecord(record)
```

The excess property check only applies when you assign an object literal
directly to a variable or argument position whose type does not specifically
list all of the properties in the object literal.
The check often catches typos in property names so it is on balance a time saver
IMO.
This is one example of the Typescript team's tendency to opt for pragmatism over
philosophical purity.
But I do often forget about excess property checking (including while writing
this primer), and it does trip me up sometimes.

In the case of `updateRecord` the best fix is to use a generic type variable
with a bound instead of relying solely on structural typing:

```ts
// This version doesn't trigger excess property checking.
async function updateRecord<T extends { id: number }>(record: T) {
  /* ... */
}
```

I'll talk more about bounds on generic type variables in the section on big idea #5.

### Classes are suggestions

You can write a function that takes a specific class as its argument type.
But due to the way Typescript implements structural typing you aren't
technically guaranteed to get an instance of the given class.
For example,

```ts
class Rectangle {
  constructor(public width: number, public height: number) { }
  area() {
    return this.width * this.height
  }
}

// This assigned value is not an instance of the class, but it is structurally compatible
const myRect: Rectangle = {
  width: 6,
  height: 2,
  area: function() { return this.width * this.height },
}

function test(rect: Rectangle) {
  // We know this will work, and will return a number.
  rect.area()

  // This might be true or false! We don't have enough information to know at this point
  rect instanceof Rectangle
}
```

Typescript treats an object as **assignable** to the type of a class if the
object has the same properties and methods, with the same types and signatures.
In the vast majority of cases structural typing does what you expect.
But there are some cases, like that `instanceof` check, where you might get an
unexpected result.

### Classes are interfaces

Sort of. Typescript has both classes and interfaces, and they are different.
But you can define a class and use it as an interface if you want to.

So what's the difference? A class is an interface with a constructor and
a predefined implementation.

```ts
class RectangleClass {
  constructor(public width: number, public height: number) { }
  area(): number {
    return this.width * this.height
  }
}

interface RectangleInterface {
  width: number
  height: number
  area(): number
}

// In 99% of cases the *types* RectangleClass and RectangleInterface are
// interchangeable.

// But only RectangleClass can be initialized with its constructor.
const rect = new RectangleClass(6, 2)
```

{% info() %}
The biggest difference between class and interface types is that interfaces are
extensible through [declaration
merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).
{% end %}

Defining a class defines two things at once: a type that only exists at design
time, and a constructor function that exists at runtime. It happens that both
things have the same name. That works because types and values exist in separate
namespaces.

```ts
// Imports the class type, but not the constructor. Because types are
// a design-time concept, this import is erased at compile time.
import type { RectangleClass } from "./shapes"

// Imports both the type and the constructor
import { RectangleClass } from "./shapes"

// Only the constructor exists at runtime
console.log(typeof RectangleClass) // prints `function`
```

## 4. Type inference is guided by flow control

When you have union types it is important to be able to identify which branch of
the union a given value belongs to. Typescript has a type-safe way to do this:
**narrowing**.
Typescript uses flow control to make inferences about which types are possible
in which code locations.

```ts
function abort(statusCode: number, message: string | null) {
  //                               ╰─────────┬──────────╯
  // When this function is called, we don't know whether `message` is null.

  if (message != null) {
    // It is not possible that `message` is null in this if branch. So
    // Typescript infers that the type of `message` in this block is `string`,
    // not `string | null`
    console.log(message.trim())
  } else {
    // In the else branch `message` must be null.
    message.trim() // Type error: 'message' is possibly null
  }

  process.exit(statusCode)
}
```

Effectively the same variable has a different type at different points in the
code. A handy way to observe this is to use an IDE, write a variable name in
a control flow block, and hover over the variable to see its type at that point.

Narrowing applies to any code that runs conditionally. For example we could have
alternatively written `message != null && console.log(message.trim())` with the
same result.

### Type guards

There are a number of built-in checks that implicitly narrow types. For example,

```ts
if (typeof message == "string") {
  // Narrow to a primitive type with Javascript's built-in typeof operator
}

if (rect instanceof Rectangle) {
  // `rect` has type Rectangle here. This requires that `rect` was constructed using
  // the `Rectangle` constructor.
}

if (Array.isArray(xs)) {
  // xs must be an array
}
```

You can also implement custom type guard functions. For more details see [The
Typescript Handbook][narrowing].

[narrowing]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

### Algebraic Data Types

Union types, object types, and narrowing combine to enable a powerful
abstraction: **algebraic data types**.
ADTs are seen in Rust in the form of enums and structs, in Scala as case
classes, and so on. Here is an example of a binary tree implemented using an
ADT:

```ts
type Tree<T> = Node<T> | Leaf<T> | Empty

type Node<T> = { tag: "node", leftSubtree: Tree<T>, rightSubtree: Tree<T>, value: T }
type Leaf<T> = { tag: "leaf", value: T }
type Empty = { tag: "empty" }

function depth<T>(tree: Tree<T>): number {
  switch (tree.tag) {
    case "node":
      // Typescript infers that `tree` has type `Node` here, so it allows
      // accessing `leftSubtree` and `rightSubtree` without errors.
      return Math.max(depth(tree.leftSubtree), depth(tree.rightSubtree))
    case "leaf":
      return 1
    case "empty":
      return 0
    // No need for a default case - Typescript infers that all possible cases
    // have been handled.
  }
}
```

In object-oriented programming a tree would be implemented using either an
interface or an abstract class for `Tree`, and subclasses for `Leaf` and `Node`.
(`Empty` might be replaced with `null`.)

The advantage of ADTs over subclasses is that a union type, like `Tree`, is
**sealed**:
it can't be extended.
That enables Typescript to perform **exhaustiveness checking**. 
If someday we added another variant to the `Tree` union without updating the
`depth` function that would introduce a bug -
`depth` would return `undefined` for any tree that contained the new variant.
But because `tree.tag` forms a set of known values, Typescript is able to detect
whether all possible cases have been handled.
So instead of a bug we would get a compiler error to remind us to update
`depth`.
(That's why I didn't included a `default` branch in the `switch`.
If we added a `default` case that throws an "unknown tree type" error that would
avoid the bug of returning `undefined`.
But it would lead to an unexpected exception instead -
and we wouldn't get a compiler error to remind us to handle the new variant.)

## 5. Functions have two parameter lists

Functions take arguments, and return a value. In TypeScript functions also take
_type_ arguments, and have a return type. Let's take a look at `useState` from
React.

```ts
const [mode, setMode] = useState("open")
```

`useState` takes an initial value, and returns a pair with a current value, and
a function to set a new value. In this example because the type of the input
value is `string` Typescript is able to infer that the type of `mode` is also
`string`, and the type of `setMode` is `(value: string) => void`. (That setter
type is simplified for this example - the real type accepts a callback or
a plain value.) To understand how Typescript can make that inference let's take
a look at the type signature for `useState` (simplified for purposes of this
example):

```ts
function useState<S>(initialState: S): [S, (value: S) => void] {
  //             ╰┬╯╰───────┬───────╯
  // type parameter list    │
  //                        │
  //                    value parameter list
  /* ... */
}
```

There are the two parameter lists. The familiar value parameter list is the part in
parenthesis.
Immediately before that the we see the type parameter list which is in angle
brackets, and lists the single parameter `S`.
`S` is a variable that will have a _type_ bound to it based on how the function is
called, much like how `initialState` is a variable that will have a _value_ bound
to it based on the value argument that the function is called with.[^parameters-vs-arguments]

[^parameters-vs-arguments]:
    The words "parameter" and "argument" are sometimes used interchangeably; but
    I like to be precise about the distinction. A parameter is a _variable_ in
    a function signature. An argument is a _value_ or _type_ that is bound to
    a parameter when the function is called. For example,

    ```ts
    const greet = (name: string) => `Hi, ${name}!`
    //             ╰┬─╯
    //            parameter

    greet("Jesse")
    //    ╰──┬──╯
    //    argument
    ```

    In Typescript a parameter has a type, and an argument has a (possibly
    different) type. To pass type checking the type of an argument must be
    _assignable_ to the type of the corresponding parameter.

A function or other type that uses type parameters is called **generic**.
The type parameter allows the programmer to describe how the function return
type relates to types of its inputs.
A type parameter can also describe how the types of a function's inputs relate
to each other.

{% tip() %}
Traditionally type parameters are written as a single capital letter. But you
can use any identifier.
{% end %}

That signature has a lot of pieces, so let's break them down:

```ts
function useState<S>(
  //             ╰┬╯
  // declaration of the type variable, `S`, which is a parameter to `useState`

  initialState: S
  //          ╰┬╯
  // `initialState` has type `S`; the specific type bound to `S` is determined
  // by the caller.

): [S, (value: S) => void]
// ╰─────────┬───────────╯
// `useState` returns a pair (a two-element array, with a specified type for
// each array position)

   [S, (value: S) => void]
// ╰┬╯
// The first element of the returned pair is a value of the same type as
// `initialValue`. We don't know what that type will be yet, but we can see that
// whatever it is, it is the same type for both values.

   [S, (value: S) => void]
//     ╰────────┬───────╯
// The second element of the returned pair is a function that takes one
// argument. The argument has the same type as `initialValue` (`S`). The return
// type of the the function is `void` which is a way of saying that the return
// value won't be used.
```

{% tip() %}
There is an equivalent arrow function syntax for a generic function:

```ts
const useState = <S>(initialState: S): [S, (value: S) => void] => {
  /* ... */
}
```
{% end %}

The signature tells us that the first argument to `useState` must have type `S`.
The return type declares that it returns a pair (a two-element array) where the
type of the first element is `S` (so the same type as `initialValue`),
and the second element is a function that that must be called with an argument
of type `S`.

{% info() %}
Many functions do not require type parameters. In those cases the type parameter
list is omitted: you don't include any angle brackets in the function
declaration. But you can imagine there is an implied, zero-length type parameter
list.

A function that does have type parameters is called **generic**.
{% end %}

### Type parameters are implicit

So if `useState` has two parameter lists why did we only provide one list of
arguments when we called it? And how does Typescript decide what type to bind
to `S`? Well you _can_ provide a type argument list when you call a function!
But type parameters are implicit - if you don't specify type arguments then
Typescript will do its best to figure out what those arguments should be.
Because `S` appears in the type of a value parameter Typescript can figure out
that `S` should be the type that it infers for the string literal, "open" -
which happens to be the type `string`.[^widening]

[^widening]:
    Since we already discussed string literal types you might expect
    the inferred type for `"open"` to be the string literal type `"open"`. But
    that would be inconvenient because then we wouldn't be able to call `setMode`
    with a different string value - the only allowed value would be `"open"`. In
    practice this is often the case. That is why Typescript applies [type
    widening][] in various contexts.

[type widening]: https://mariusschulz.com/blog/literal-type-widening-in-typescript

But maybe Typescript's inferred type for `S` doesn't work for you. Let's say
that the only possible modes are `"open"` or `"closed"`, and you want the type
checker to make sure that `setMode` can only be called with one of those values.
To do that you can provide an explicit type parameter list:

```ts
const [mode, setMode] = useState<"open" | "closed">("open")
```

That binds the type argument `"open" | "closed"` to the parameter `S`.
(As we discussed previously this union type is a set with only two possible
values, the strings `"open"` or `"closed"`.)
Now Typescript infers that the type of `mode` is also `"open" | "closed"`, and
will only allow calling `setMode` with an argument of the same type. Typescript
will also verify that the initial value provided has a type that is
**assignable** to the type argument.

{% tip() %}
You will often want to provide an explicit type argument like this if the
initial value given to `useState` is `null`. In that case Typescript has no good
way to infer the type you have in mind.

Remember that a nullable type is specified as a union, such as `"open"
| "closed" | null` or `string | null`
{% end %}

### Constraints on type parameters

In the last example the type parameter `S` was **unconstrained**. That means
that `useState` can be called with an initial value of absolutely any type. Very
often it is important to put constraints on type variables because you don't
want every function to be callable with any type of argument.
Here is an example of a constrained type parameter:

```ts
function findById<T extends { id: string }>(
  id: string,
  xs: T[]
): T | undefined {
  return xs.find((x) => x.id === id)
}
```

The syntax `T extends { id: string }` means that the parameter `T` will only
accept types that are assignable to `{ id: string }`. Every object type that
has an `id` property that is a string is assignable to `{ id: string }`, even if
it also has other properties.
With that constraint in place the implementation of `findById` can make
assumptions about the value of each `x` that would not be possible otherwise:
we don't know exactly what `x` will be, but we can assume that it has an `id`
property.
So `findById` accepts an array of objects and returns the one with an `id`
property that matches the given search value.

### Relations between type parameters

A function may take multiple type parameters, and constraints on type parameters
may reference other parameters in the same list.

```ts
function getOrDefault<Obj, Key extends keyof Obj>(
  obj: Obj,
  key: Key,
  def: NonNullable<Obj[Key]>
): NonNullable<Obj[Key]> {
  const value = obj[key]
  return value != null ? value : def
}
```

`getOrDefault` is called with an object, a key of that object, and a default
value. If the object property value for the given key is not `null` or
`undefined` that value is returned. Otherwise the default value is returned
instead which may not be `null` or `undefined`.
The type signature requires that the type of the default value matches the type
of the object's property for the given key.
Typescript's built-in `NonNullable` [utility type][] restricts the
default value type so that it cannot be `null` or `undefined`.

[utility type]: https://www.typescriptlang.org/docs/handbook/utility-types.html

Note that the type parameter `Key` is **constrained** using a reference to the
preceding type parameter, `Obj`.
The `extends` keyword specifies that the only valid types for the variable `Key`
are subtypes of `keyof Obj`.
The value for `key` will be a string, but it can't be any string. It must match
one of the known keys of the type `Obj`.

Here is an example of how `getOrDefault` can be used:

```ts
interface User {
  name: string,
  role: "viewer" | "commenter" | "editor" | null
}

function test(user: User) {
  const role = getOrDefault(user, "role", "viewer")
  //    ╰┬─╯
  // Type of role is "viewer" | "commenter" | "editor"

  // Error: argument of type null is not assignable to the parameter of
  // type 'NonNullable<"viewer" | "commenter" | "editor" | null>'
  getOrDefault(user, "role", null)

  // Error: argument of type "viewwer" is not assignable to the parameter of
  // type 'NonNullable<"viewer" | "commenter" | "editor" | null>'
  getOrDefault(user, "role", "viewwer")

  // Error: argument of type "rrole" is not assignable to the parameter of
  // type 'keyof User'
  getOrDefault(user, "rrole", "viewer")
}
```

The syntax `keyof Obj` gives a type that is a union of the _types_ of keys in
`Obj`.
For example the _type_ `User` has keys `"name"` and `"role"`;
so `keyof User` evaluates to `"name" | "role"`.
In the example above where the object type is `User`, and the `key` argument to
`getOrDefault` is `"role"`, Typescript infers that the type of `Key` is `"role"`
the type `"role"` is a subtype of `"name" | "role"`:
the one possible value of type `"role"` (the string `"role"`) is also a possible
value of the type `"name" | "role"`.
So that works out.

The syntax `Obj[Key]` evaluates to the _type_ of a property with a given key in
the object type, `Obj`. 
In the example `Obj` gets the type `User`, and `Key` gets the type `"role"`;
so `Obj[Key]` evaluates to `User["role"]`.
From the given interface you can see that `User["role"]` evaluates to the type
`"viewer" | "commenter" | "editor" | null`.

This mirrors the _value_ expression `obj[key]` which evaluates to the value at
a given key. For example for a _value_ `user` of type `User`, `user["name"]`
might have a value like `"Jesse"`.

{% tip() %}
You might expect `Obj` to have a constraint like `Obj extends object`. But that
isn't necessary. Yes, the function would throw an exception if `obj` was `null`
or `undefined`. But `keyof null` and `keyof undefined` both evaluate to empty
sets so `getOrDefault` is not callable if `obj` is `null` because there is no
possible value to provide for `key`.
{% end %}

## 6. Types can be functions too

This last section gets into advanced topics that aren't necessary for most
Typescript programming.
But it points to an idea that makes Typescript special,
that you might be benefiting from without realizing it.
Feel free to come back to this one after you've had time to become comfortable
with the other ideas.

We've seen how functions can have type parameters - they can be generic.
Classes, interfaces, and type aliases can also have type parameters.
For example, arrays are generic over the type of elements they contain.
You can have `Array<number>`, `Array<string>`, `Array<User>` -
those are all different types.

{% tip() %}
Usually an array type is given using the shorthand `T[]` instead of `Array<T>`.
I'm using the long form to illustrate the connection to other generic types.
The two forms are equivalent.
{% end %}

The type `Array` without a type argument is **not** a concrete type.
In type theory `Array` is called a **type constructor** because it constructs
concrete types when given some input type.
Like a function!
But this function operates on the type level:
instead of value inputs, and a value output it takes _type_ inputs, and gives
a type output.
You can take an input type, like `number`, feed it to the `Array` type
constructor, and get the concrete type that we write as
`Array<number>`.[^first-class type constructors]

```ts
// Value-level function application
let xs = new Array(1)

// Type-level function application
type NumericArray = Array<number>
```

[^first-class type constructors]:
  Typescript does not let you use `Array` as a type by itself.
  For example, you can't write `type MyArray = Array`.
  Same goes for any other type constructor. Although Typescript (like Javascript)
  has first-class functions, it does not have first-class type constructors.
  Instead you have to write `type MyArray<T> = Array<T>`.

The idea of type constructors exists in every language with generic types.
But the idea of type-level functions goes much further in Typescript!
Things get really interesting when you start using generic type aliases.
Here's an example from [The Typescript Handbook][Flatten] that
transforms a nested array type into a flat array type:

[Flatten]: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

```ts
type Flatten<T> = T extends any[] ? T[number] : T

const xs = [[1, 2], [3, 4]]
//    ╰┬╯
//   Type of `xs` is number[][] - an array of arrays

const ys: Flatten<typeof xs> = xs.flat()
//    ╰┬╯
//   Type of `ys` is number[] - an array of numbers

console.log(ys) // prints: [1, 2, 3, 4]
```

`Flatten` is a type-level function that transforms a nested array type into
a flat array type.
The definition introduces some new concepts, so let's walk through them.
The first is [conditional types][], which brings branching logic to the type
level.

```ts
type Flatten<T> = T extends any[] ? T[number] : T
//          ╰┬╯   ╰────────┬────╯   ╰───┬───╯  ╰┬╯
// `T` could be anything   │            │       │
//                         │            │       │
//      check: is T an array type?      │       │
//                                      │       │
//      if yes, let Flatten<T> be element type  │
//                                              │
//        otherwise, let Flatten<T> the same type as T
```

Another concept is [indexed access][].
At the value level,
given an array of, let's say, strings, you can get a string value by accessing
an index of the array.

```ts
const xs = ["foo", "bar"]
const x = xs[1] // evaluates to "bar"
```

Because `xs` is an array of strings, for any numeric index you put into the
indexed access (as long as that index is within the array bounds) you get
a string back. Typescript's type-level indexed access lets you make the same
statement in the form of a type expression:

```ts
type ElementType<T> = T[number]  // Oh look, another type-level function!
type XsElemType = ElementType<typeof xs>  // `XsElemType` is now an alias for `string`
```

{% tip() %}
Indexed access also works on object types.
Consider the type, `type User = { name: string, age: number }`.
The type expression `User["name"]` simplifies to `string` because every `User`
value has a `string` value in its `name` property.
And `User["name" | "age"]` simplifies to `string | number`.
Going a step further, `User[keyof User]` also simplifies to `string | number`.
{% end %}

Putting conditional types and indexed access together,
we can follow an application of `Flatten`:

```ts
type Flatten<T> = T extends any[] ? T[number] : T

// We'll use some made-up syntax to walk through the evaluation steps
Flatten<number[][]>
  → number[][] extends any[] ? (number[][])[number] : number[][]  // yes, number[][] is a subtype of any[]
  //                           ╰───────┬──────────╯
  //         ┌─────────────────────────┘
  → (number[][])[number]  // simplifies to type of one element of the number[][] array type
  // ╰──┬───╯
  //    │
  → number[]
```

So `Flatten<number[][]>` simplifies to `number[]`,
which flattens one level of the nested array type.

What if we used `Flatten` on a non-array type?

```ts
Flatten<number>
  → number extends any[] ? (number)[number] : number  // no, number is not a subtype of any[]
  //                                          ╰─┬──╯
  //   ┌────────────────────────────────────────┘
  → number
```

Then you get out the same type you put in.
If you'd rather this case be an error you can specify that there are no allowed
values of the type `Flatten<number>` by using the empty set type, `never`:

```ts
type Flatten<T> = T extends any[] ? T[number] : never
```

Can you write a recursive type to flatten an arbitrarily deeply nested array
type!
You sure can!
It takes same care because it's easy to overshoot, and evaluate to the scalar
element type instead of a type for a flat array.
If you're interested, copy the snippet below into the [Typescript Playground][],
and modify the `Flatten` type until there are no errors.

```ts
type Flatten<T> = T extends any[] ? T[number] : T

const xs: Flatten<number[][][]> = [1, 2, 3]
```

This is a taste of Typescript's type-level programming capabilities.
I didn't get into [mapped types][],
which are fantastic for type-safe data parsing.
For more on that topic see my article,
[Checking Types Against the Real World in TypeScript](/2018/04/12/checking-types-against-the-real-world.html/).

## Conclusion

So those are the big ideas.
Some will have been very familiar if you have experience with other type-checked
languages.
Generics are everywhere; ADTs have gained popularity.
Some are unusual, like untagged unions, intersections, and narrowing.
Conditional and mapped types give a level of expressive power that you won't see
outside of research languages.
When you put all the ideas into one package, you get Typescript!

If there is one feature I miss from other languages it is ad-hoc polymorphism
which you see in Rust as traits, and in Haskell as type classes.
But that is a feature that is only possible with a compiler that uses type
information to write a compiled program.
That's contrary to Typescript's nature.
Typescript is Javascript, with the types written in the source file instead of
in your head.
You can take a Typescript program, cover up the type parts with your fingers,
and it's Javascript.
Or you can take any Javascript program,
and with enough work type-check every part of it.
Typescript does what it needs to do to make that work.
