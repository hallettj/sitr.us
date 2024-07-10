+++
title = "`void` is not a unit type in TypeScript"
date = 2021-12-04
path = "2021/12/04/void-is-not-a-unit-type.html"

[taxonomies]
tags = ["TypeScript", "type theory"]
+++

In type theory a **unit type** is any type that represents exactly one possible
value.
The unit types in TypeScript include `null`, `undefined`, and literal types.

TypeScript also has the type `void` which is used as the return type for
functions that don't have an explicit return value.
In JavaScript a function that does not explicitly return implicitly returns
`undefined`;
so at first glance it would seem that `void` is an alias for the `undefined`
type.
But it is not!

<!-- more -->

We can test this by checking assignability:

```ts
declare const u: undefined
declare const v: void

// This is OK
const x: void = u

// @ts-expect-error: Type 'void' is not assignable to type 'undefined'.
const y: undefined = v
```

If they were the same type, `undefined` and `void` would be mutually assignable.

According to the [Handbook][],
"[`void` is] the absence of having any type at all."
TypeScript is nicely consistent with the behavior of types as sets.
(`any` is an exception because it does not behave like a well-defined set.)
"The absence of any type at all" is not a sensical statement about sets;
so that description seems odd to me.
But that may be a way of explaining that in some ways `void`, like `any`, does
not behave as a well-defined set.

[handbook]: https://www.typescriptlang.org/docs/handbook/basic-types.html#void

{% info() %}
Wait, types are sets? For details take a look at [`never` and `unknown` in
TypeScript](@/2019-01-29_never-and-unknown-in-typescript/index.md)
{% end %}

`undefined` is assignable to `void` which tells us that the type `void` does
include the value `undefined`.
From a type theory perspective the fact that the reverse is not allowed implies
that `void` represents a set of possible values that includes values other than
`undefined`.
And we can see that is true in practice.
If you have a variable with a function type where the return type is `void`, any
function is assignable to that variable regardless of the actual return type as
long as the argument types are compatible.

```ts
function foo(cb: () => void) {
  // What are the possible values for x?
  const x = cb()
}

// All of these examples type-check
foo(() => "foo")
foo(() => 1)
foo(() => true)
```

This behavior is convenient - instead of requiring certain return values the use
of `void` in this case is more like a statement by the caller that it will
ignore the return value of the callback.
But we can see in this example that although the type of `x` is `void`,
values assigned to `x` could strings, numbers, or booleans.
In fact `x` could be assigned any type of value!

This makes it look like it would be most accurate to think of `void` as an alias
for `unknown`.
That would be consistent with the assignability tests from before:
`undefined` is assignable to `unknown`, but `unknown` is not assignable to
`undefined`.
But now let's look at the ways in which `void` does not behave like a set.

If `void` were a set that contains every possible value
(and in the `foo` example we have seen that in practice it is)
then we should be able to assign any value to a variable of type `void`.
But it turns out that the only value that TypeScript will permit assigning to
a variable of type `void` is `undefined`:

```ts
// @ts-expect-error: Type 'string' is not assignable to type 'void'.
const a: void = "foo"

// @ts-expect-error: Type 'number' is not assignable to type 'void'.
const b: void = 1

// @ts-expect-error: Type 'boolean' is not assignable to type 'void'.
const c: void = true
```

It looks like either TypeScript has a special rule that prohibits assignment to
`void` variables, or TypeScript thinks of `void` as a small set but the `void`
return callback feature lets non-`void` values "leak" into `void` variables.

My suggestion for making TypeScript more consistent is to make `void` a proper
alias of `undefined`.
It's possible the reason that it was not set up that way in the first place is
that `void` predates `unknown`.
In any case, that is how I am going to think of `void` going forward.
