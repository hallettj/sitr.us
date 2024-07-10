+++
title = "I finally set up XMonad to build with Stack!"
date = 2018-05-13
path = "2018/05/13/build-xmonad-with-stack.html"
description = "Reconfiguring the XMonad window manager involves having XMonad recompile itself. It took some effort to get XMonad to build itself using my preferred dependency management and build tool, Stack. Here's how I did it."

[taxonomies]
tags = ["Haskell", "XMonad"]
+++

The [XMonad][] window manager is configured in Haskell.
That means that when you want to apply a new configuration you actually build
xmonad itself incorporating code from your configuration file.
It sounds more painful than it is -
when you install xmonad you get an executable called `xmonad` that handles the
details of bootstrapping your custom build.
The command `xmonad --recompile` builds `~/.xmonad/xmonad.hs`,
and subsequent invocations of `xmonad` run the executable that is produced.

When you configure xmonad you are actually writing your own version of the
program.
Because you can write arbitrary code the possibilities for customization are
endless!
As with any software project,
you get maximum expressive power when you bring in third-party libraries.
`xmonad-contrib` is a popular choice -
but you can import any Haskell library that you want.
With libraries come the problem of managing library packages.
In the past I used the `cabal` command to globally install library packages.
From time to time I would clear out my installed packages,
or change something while working on another Haskell project,
and then my window manager would stop working.
I wanted a better option.

[Stack][] is my preferred dependency management and build tool for Haskell
projects.
Stack automatically fetches project dependencies,
and maintains isolated sets of installed packages for each project.
With stack I declare dependencies in a [.cabal file][my-xmonad],
and stack ensures that I have up-to-date copies of all libraries whenever
xmonad builds itself.

To use stack I needed to hook into xmonad's build process.
I used this [blog post][] as a starting point.
That post provides instructions for using the `stack ghc` command to invoke ghc
in an environment prepared by stack.
But I have some custom code modules in `~/.xmonad/lib/`,
and I had problems getting ghc to find those when running `stack ghc`.
So I opted to set up a fully-fledged stack project which is built with the
usual `stack build` command.
You can take a look at my [~/.xmonad/][.xmonad] directory to get the high-level view.

The key is the [build][] script.
Starting in xmonad v0.13 if there is an executable called `build` in your
`~/.xmonad/` directory then xmonad will defer to that script.
`build` gets a path as an argument which is where the compiled xmonad executable
should be placed.
My script looks like this:

```sh
#!/bin/sh

set -e

stack build :my-xmonad --verbosity error
stack install :my-xmonad --local-bin-path bin/ --verbosity error
mv bin/my-xmonad "$1"
```

My `my-xmonad.cabal` file declares an executable named `my-xmonad`
(which is actually my customized version of xmonad).
This script builds that executable,
installs the it to `~/.xmonad/bin/my-xmonad`
(thanks to the `--local-bin-path` argument to `stack install`),
and finally moves the executable to the location given by the first argument to
the `build` script.

You can detailed on working with stack from stack's [user guide][].
If you want to get going quickly I created a stack [project template][] to set
up xmonad with stack.
Here is what you do:

- Install xmonad and stack using your preferred package manager - you need xmonad v0.13 or later.
- Run `stack new my-xmonad https://raw.githubusercontent.com/hallettj/dot-xmonad/master/home/.xmonad/xmonad.hsfiles`
- If you are setting up a new xmonad configuration then `mv my-xmonad ~/.xmonad`. Otherwise copy files from `my-xmonad/` to `~/.xmonad/` and then delete `my-xmonad/`. The relevant files are:
  - `my-xmonad.cabal`, your project manifest
  - `build`
  - `lib/` - this directory must exist or the project will not build!
  - `xmonad.hs`, in case you do not have your own
  - `.gitignore`, in case you want to version-control your xmonad config
- `chmod a+x ~/.xmonad/build` - if the build script is not marked as executable xmonad will not execute it.
- In `~/.xmonad/` run `stack setup` to install the version of ghc that stack wants to use. (Stack installs ghc in a sandbox so that it does not conflict with any other ghc installation on your machine.)

Names of any custom modules that you have in `~/.xmonad/lib` need to be listed in the `other-modules` section in `~/.xmonad/my-xmonad.cabal`.
If you want to add library dependencies beyond `xmonad` and `xmonad-contrib`
then add them to the `build-depends` section in the same file.
Stack pulls dependencies from [Stackage][],
which hosts curated sets of packages.
The `resolver` setting in `stack.yaml` determines the version of each
dependency that you get,
and the version of ghc that stack will use to compile xmonad.
If you want to use libraries that are not hosted on Stackage you will need to
list package names with exact version numbers in the `extra-deps` section in
`stack.yaml` according to [these instructions][extra-deps].

Test everything by running `xmonad --recompile` from any directory.
If that works then you are all set!

[Stack]: https://docs.haskellstack.org/en/stable/README/
[XMonad]: http://xmonad.org/
[my-xmonad]: https://github.com/hallettj/dot-xmonad/blob/master/home/.xmonad/my-xmonad.cabal
[blog post]: http://brianbuccola.com/how-to-install-xmonad-and-xmobar-via-stack/
[.xmonad]: https://github.com/hallettj/dot-xmonad/tree/master/home/.xmonad
[build]: https://github.com/hallettj/dot-xmonad/blob/master/home/.xmonad/build
[user guide]: https://docs.haskellstack.org/en/stable/GUIDE/
[project template]: https://raw.githubusercontent.com/hallettj/dot-xmonad/master/home/.xmonad/xmonad.hsfiles
[Stackage]: https://www.stackage.org/
[extra-deps]: https://docs.haskellstack.org/en/stable/GUIDE/#extra-deps
