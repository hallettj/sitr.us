+++
title = "Type-Driven Development with TypeScript"
date = 2018-02-12
path = "2018/02/12/type-driven-development-with-typescript.html"

[taxonomies]
tags = ["TypeScript", "type theory"]
+++

_This is an excerpt of [a post][original] that I wrote for [Olio Apps][]._

I am always interested in making my coding process faster and more robust.
I want to be confident that my code will work as expected. And I want to spend
as little time as possible debugging, testing, and hunting down pieces of code
that I forgot to update when I make changes to a project. That is why I am a fan
of correct-by-construction methods. Those are methods of constructing programs
where the program will not build / compile unless it behaves the way that it is
supposed to.

<!-- more -->

## Correct by construction

Test-driven development is one form of correct-by-construction method. The
philosophy of test-driven development is that your tests are the specification
for how your program should behave. If you look at your test suite as
a mandatory part of your build process, if your tests do not pass the program
does not build because it is not correct. Of course the limitation is that the
correctness of your program is only as certain as the completeness of your
tests. Nevertheless studies have found that
[test-driven development can result in 40%-80% fewer bugs in production][tdd-bugs].

### Writing your program around types

Type-driven development is the practice of writing your program around types,
and of choosing types that make it easy for the type checker to catch logic
errors. In type-driven development your data types and type signatures are the
program specification. Types also serve as a form of documentation that is
guaranteed to be up-to-date. Type-driven development is another
correct-by-construction method. As with test-driven development, type-driven
development can improve your confidence in your code, and can save you time when
making changes to a large codebase.

_[» Read the rest][original] on the Olio Apps blog._

[original]: https://www.olioapps.com/blog/type-driven-development-with-typescript/
[Olio Apps]: https://www.olioapps.com/
[tdd-bugs]: http://evidencebasedse.com/?q=node/78
