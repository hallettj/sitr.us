+++
title = "Checking Types Against the Real World in TypeScript"
description = "Learn how to use io-ts validators to ensure that incoming data is compatible with your program contracts."
date = 2018-04-12
path = "2018/04/12/checking-types-against-the-real-world.html"

[taxonomies]
tags = ["TypeScript"]
+++

_This is an excerpt of [a post][original] that I wrote for [Olio Apps][]._

The shape of data defines a program. There are important benefits to writing out
types for your data.

Let’s consider a Hacker News client, which consumes stories and other items from
the Hacker News API. This is a TypeScript type that describes the format for
stories:

```ts
type Story = {
  type: "story",
  by: string,  // username
  dead?: boolean,
  deleted?: boolean,
  descendants: number,
  id: number,
  kids?: number[],  // numeric IDs of comments
  score: number,
  text?: string,  // HTML content if the story is a text post
  time: number,  // seconds since Unix epoch
  title: string,
  url?: string  // URL of linked article if the story is not a text post
};
```

In Javascript and other dynamically-typed languages, it is common to write
a program without any explicit description of a data structure like Story. The
shape of the data is implied in the code that manipulates the data. But that
means anyone reading the code has to mentally reconstruct that shape from
context, or refer to documentation outside of the program itself.

_[» Read the rest][original] on the Olio Apps blog._

[original]: https://www.olioapps.com/blog/checking-types-real-world-typescript/
[Olio Apps]: https://www.olioapps.com/
