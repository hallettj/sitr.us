+++
title = "When to use `never` and `unknown` in TypeScript"
date = 2019-01-29
path = "2019/01/29/never-and-unknown-in-typescript.html"

[taxonomies]
tags = ["TypeScript", "type theory"]
+++

_This is an excerpt of [a post][original] that I wrote for [LogRocket][]._

{{ invertible_image(
  src="/2019/01/29/never-and-unknown-in-typescript.html/string-union-number.png"
  alt="venn diagram of the string and number types, and their union"
) }}

The `never` and `unknown` primitive types were introduced in TypeScript [v2.0][]
and [v3.0][] respectively. These two types represent fundamental and
complementary aspects of type theory. TypeScript is carefully designed according
to principles of type theory, but it is also a practical language, and its
features all have practical uses – including `never` and `unknown`. To
understand those uses we will have to begin with the question, what exactly are
types?

<!-- more -->

## Types explained using set theory

When you get down to a fundamental definition a type is a set of possible
values, and nothing more. For example, the type `string` in TypeScript is the
set of all possible strings. The type `Date` is the set of all instances of the
`Date` class (plus all structurally-compatible objects), and the type
`Iterable<T>` is the set of all objects that implement the iterable interface
for the given type of iterated values.

TypeScript is especially faithful to the set-theoretic basis for types; among
other features, TypeScript has union and intersection types. A type like `string
| number` is called a "union' type because it literally is the union of the set
of all strings, and the set of all numbers.

_[» Read the rest][original] on the LogRocket blog._

[original]: https://blog.logrocket.com/when-to-use-never-and-unknown-in-typescript-5e4d6c5799ad/
[LogRocket]: https://logrocket.com/
[v2.0]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html
[v3.0]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html
