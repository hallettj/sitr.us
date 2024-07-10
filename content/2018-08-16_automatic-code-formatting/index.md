+++
title = "Automatic Code Formatting for Partially-Staged Files"
date = 2018-08-16
path = "2018/08/16/automatic-code-formatting.html"
description = "I wrote git-format-staged to apply an automatic code formatter or linter to staged files. It ignores unstaged changes, and leaves those changes unstaged. When run in a Git pre-commit hook git-format-staged guarantees that committed files are formatted properly, and does not clobber unstaged changes if formatting cannot be applied to working tree files cleanly."

[taxonomies]
tags = ["git", "automatic formatting"]
+++

_This is an excerpt of [a post][original] that I wrote for [Olio Apps][]._

I wrote [git-format-staged][] to apply an automatic code formatter or linter to
staged files. It ignores unstaged changes, and leaves those changes unstaged.
When run in a Git pre-commit hook git-format-staged guarantees that committed
files are formatted properly, and does not clobber unstaged changes if
formatting cannot be applied to working tree files cleanly.

## How I learned to love automatic formatting

I used to pay a lot of attention to code formatting. I would split or join
lines, indent to just the right column, and so on. Then I learned about
[Prettier][], and tried it out in my Javascript projects. After setting up an
editor plugin I could tap a key combination, and Prettier would do the same
things that I was doing by hand in an instant without any thought on my part.
The code did not wind up in exactly the style that I was used to - but it was
formatted according to a set of consistent, sensible rules that I can live with.
I realized that if I can trust a program to format my code nicely I can free up
a not-insubstantial chunk of my attention. That leaves me with more mental
capacity to devote to matters that actually require human input. I have not
looked back!

_[» Read the rest][original] on the Olio Apps blog._

[original]: https://www.olioapps.com/blog/automatic-code-formatting/
[Olio Apps]: https://www.olioapps.com/
[git-format-staged]: https://github.com/hallettj/git-format-staged/blob/master/README.md
[Prettier]: https://prettier.io/
