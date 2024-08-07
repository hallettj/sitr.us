+++
title = "Dev environment for Rust using Nix"
draft = true
date = 2024-06-01

[taxonomies]
tags = ["Nix", "Rust"]

[extra]
toc_ignore_pattern = "Table of Contents"
toc_levels = 2
+++

I use Nix to set up reproducible development environments for my Rust projects.
This ensures that everyone working on the project is using the same Rust
toolchain.
You can get that with [rustup][], but the advantage of Nix is that you can also
lock versions of other dependencies, like non-Rust libraries, utilities, database servers
for testing, or whatever you need.
For example instead of writing in your readme, "make sure you have the
`openssl-dev` package installed", you can simply write, "use nix".

<!-- more -->

[rustup]: https://rust-lang.github.io/rustup/

## Table of Contents

<!-- toc -->

## Prerequisites

This setup works on any Linux distribution, MacOS, or Windows using WSL.
You'll need the Nix package manager.
It doesn't mess with the rest of your system - all Nix packages are kept
isolated in `/nix/store/`.

- [install the Nix package manager](https://nixos.org/download/)
- [enable the `flakes` and `nix-command` experimental features](https://nixos.wiki/wiki/Flakes)
- optionally [install direnv](https://direnv.net/docs/installation.html)

Finally `cd` to your Rust project directory. Either create an empty git
repository, or open an existing Rust project. (Git version control is required
either way.)

## Declare a Rust toolchain

There are multiple options for declaring a toolchain with the Nix setup we'll be
using, but I recommend writing a `rust-toolchain.toml` file because rustup will
also read that file, so if you have people working on the project who choose to
use rustup instead of nix they will get the same toolchain.

Here's an example `rust-toolchain.toml` that gets a stable Rust version:

```toml
[toolchain]
channel = "1.78.0"
profile = "default"       # see https://rust-lang.github.io/rustup/concepts/profiles.html
components = ["rustfmt"]  # see https://rust-lang.github.io/rustup/concepts/components.html
```

{% tip() %}
If you update the toolchain channel version at a later date you will also need
to update rust-overlay (which we talk about in the next section). See the
notes on updating later in this post.
{% end %}

## Write a flake

A Nix [flake][] is a combination of a project manifest and a build system. We're
going to write one that declares some inputs which include nixpkgs, and
rust-overlay (which provides your declared Rust toolchain).
The flake will declare a `devShell` which is what sets up your reproducible dev
environment.

[flake]: https://nix.dev/concepts/flakes.html

Create a file called `flake.nix` with this content:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    systems.url = "github:nix-systems/default";
  };
  outputs =
    { self
    , nixpkgs
    , rust-overlay
    , systems
    }:
    let
      makePkgs = system: nixpkgs.legacyPackages.${system}.extend rust-overlay.overlays.default;
      perSystem = callback: nixpkgs.lib.genAttrs (import systems) (system: callback (makePkgs system));
      rustToolchain = pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
    in
    {
      devShells = perSystem (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = [
            (rustToolchain pkgs)

            # Optional: examples of some other stuff you can install in yor
            # devShell. Find packages with https://search.nixos.org/packages
            pkgs.openssl.dev # if your project depends on the native openssl lib
            pkgs.postgresql # to get the psql client, or the database server
            pkgs.cargo-insta # for snapshot testing
            pkgs.cargo-machete # finds unused Rust dependencies
          ];
        };
      });
    };
}
```

For most projects the only changes you'll need to make are to the list of
packages in the `nativeBuildInputs` list which defines what is installed in your
devshell. We'll talk more about each part of this `flake.nix` after we talk
about how to use the devshell. For now note that list items in
`nativeBuildInputs` are separated by whitespace, not by commas. So expressions
that contain spaces, like `rustToolchain pkgs`, need to be surrounded by
parenthesis.

{% warning(title="Important") %}
At this point make sure that `flake.nix` and
`rust-toolchain.toml` are committed to version control, or at least staged. When
you are using a flake Nix cannot see untracked files (but it can see unstaged
changes to tracked files). So you might see errors about missing files if those
files are untracked.
{% end %}

## Enter the devshell

Run the magic command,

```sh
$ nix develop
```

That will download a bunch of stuff, and put you in a new shell session with
your devshell set up. Everything in the devshell is installed to `/nix/store/`
- Nix doesn't put anything in your bin directories. The devshell sets a `PATH`
environment variable to bring in all of the devshell executables, and it does
some more environment variable magic to shared library files available.

If you check the location of `cargo` you should see something like this:

```sh
$ which cargo
/nix/store/caajx4xfg1qq4chcxc417bj93qpmlmv9-rust-default-1.78.0/bin/cargo
```

When you exit the devshell all of that stuff disappears. And you can create
a different devshell for a different project with different versions of
everything.

At this point you have the `cargo` command available so you can run `cargo init`
to create some Rust project files if you don't have them already. Remember to
track all of the new files in version control so that Nix can see them!

Likewise you have access to those other devshell packages. For example you can
run `cargo machete` at this point.

## About `flake.lock`

At this point you should see a file called `flake.lock` appear. This file
freezes revisions of all of the inputs declared in `flake.nix`. To make sure
your dev environment is reproducible you should commit `flake.lock` to version
control.

## Make it automatic with direnv

Direnv is a handy tool that automatically makes changes to your shell session
when you `cd` into a project directory, and automatically reverses those changes
when you `cd` to a different directory. Direnv is not specific to Nix, but the two
combine very nicely. You can use direnv to automatically apply the flake
devshell when you `cd` into your project without entering a subshell. To do that
create file called `.envrc` with this content:

```sh
if ! has nix_direnv_version || ! nix_direnv_version 3.0.4; then
  source_url "https://raw.githubusercontent.com/nix-community/nix-direnv/3.0.4/direnvrc" "sha256-DzlYZ33mWF/Gs8DDeyjr8mnVmQGx7ASYqA5WlxwvBG4="
fi

use flake
```

The next time you press enter in your terminal you should see a message like
this:

```
direnv: error /my/rust/project/.envrc is blocked. Run `direnv allow` to approve its content
```

Direnv can run arbitrary code which is why it is important to opt in to running
it for each project. Like the message says, run

```sh
$ direnv allow
```

If you already ran `nix develop` this should be quick. If not you might see
a message saying something like "direnv is taking a long time to run". Don't
worry about that - once dependencies are cached entering the devshell will be
very quick.

Now your devshell will be automatically applied whenever you `cd` into the project
directory. Note only that, whenever `flake.nix` changes direnv will
automatically apply the new settings the next time you press enter in the
terminal. So you can add packages to your devshell and they will be available
immediately.

{% info() %}
For more on using Nix flakes and direnv together see [Effortless dev environments with Nix and direnv](https://determinate.systems/posts/nix-direnv).
{% end %}

Strictly speaking the only required line in `.envrc` is `use flake`. But there
is an add-on for direnv, [nix-direnv][], that makes the devshell setup much
faster. I think the manual installation for nix-direnv is intimidating for
people who aren't well acquainted with nix. So the first three lines of `.envrc`
install nix-direnv automatically if it isn't already installed. Those lines run
a script downloaded from the internet so feel free to remove them if you're not
comfortable with that. Or if you want to keep the automatic installation, and
you want to get a newer version of nix-direnv you can grab the latest automatic
installation snippet [here](https://github.com/nix-community/nix-direnv?tab=readme-ov-file#direnv-source_url).

[nix-direnv]: https://github.com/nix-community/nix-direnv

## Apply the same dev environment in your editor

You're probably running rust-analyzer in your editor, and it's important that
rust-analyzer uses your project's Rust toolchain. So you will want to apply your
devshell setup to your editor in addition to your shell.

If you open your editor from your development shell you can skip this step
because your editor will inherit the necessary environment variables from your
shell.

If you launch your editor separately from your shell the easiest way to go is to
set up direnv in your editor.

- for VSCode you can install a [direnv extension](https://marketplace.visualstudio.com/items?itemName=Rubymaniac.vscode-direnv)
- for Vim or Neovim you can install the [direnv.vim](https://github.com/direnv/direnv.vim) plugin
- add-ons for other editors are available

Editor integration works similarly to direnv in the shell: when you open
a directory, or `cd` to a directory depending on how your editor does things,
the devshell will apply automatically.

## Make sure it's reproducible

By default your devshell will have access to everything that is normally
installed on your system. This is true whether you use direnv or `nix develop`.
It's possible that you might accidentally depend on some library or executable
that you have installed that is not declared in your devshell. To test for this
you can enter the devshell in "pure" mode in which case Nix will unset all
existing environment variables before setting the devshell env vars:

```sh
$ nix develop --ignore-environment
```

You might want to build and run tests in a pure devshell occasionally to make
sure it works.

## Updating

I mentioned earlier that if you want to upgrade to a Rust version that was
released after you set up your Nix configuration you need to update
`rust-overlay` which is one of the inputs declared in `flake.nix`. To do that
run,

```sh
$ nix flake lock --update-input rust-overlay
```

If you are using other package you may also want to update nixpkgs from time to
time which you can do with a similar command. Or you can update all flake inputs
at once with,

```sh
$ nix flake update
```

Those commands update `flake.lock`. You can roll back updates by restoring an
earlier revision of `flake.lock`.


## What if I don't want to or can't add Nix files to a project repo?

TODO

## What's all this stuff in `flake.nix`?

In the long term if you want a good understanding of Nix and Nix flakes
I recommend reading the go-to Nix primer, [Nix Pills][], and I recommend
following that up with [flake documentation][flake]. But I'll give a quick
overview here.

[Nix Pills]: https://nixos.org/guides/nix-pills/

### A little Nix syntax background

#### Nested property syntax

You'll see expressions like this in flakes:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };
}
```

I had a hard time getting past this when I started learning about Nix because it
looks like that assigns a property called `url` to some undeclared pre-existing
object. But that's not what's happening. The dot syntax is syntactic sugar for
concisely defining a nested dictionary. The above desugars to:

```nix
{
  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    };
  };
}
```

Both of the above are also equivalent to,

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
}
```

#### Function syntax

Function definitions have the form `<parameter>: <function body>`. In our
`flake.nix` file this expression,

```nix
rustToolchain = pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
```

assigns a function to a variable. The variable accepts a parameter named `pkgs`.
The body of the function is `pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml`.

```nix
  pkgs:  pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml
# ────   ───────────────────────────────────────────────────────────
#   ↑                                      ↑
# function parameter                  function body
```

Functions are called by placing a space between the function and its argument.
So that we can break down that function body into a function call and an
argument:

```nix
  pkgs.rust-bin.fromRustupToolchainFile  ./rust-toolchain.toml
# ─────────────────────────────────────  ─────────────────────
#                  ↑                              ↑
#               function                      argument
```

Parenthesis are used exclusively for grouping expressions, not for function
invocation.

### inputs and outputs

The entire flake has two properties (or **attributes** in Nix parlance):
`inputs` and `outputs`.

Inputs declares arbitrary names for each input, and provides a URL (or file path) to fetch for each. 

Outputs is a function that takes fetched & evaluated inputs, and produces
a dictionary (or **attribute set** in Nix parlance) of devshells, packages, or
checks, among other options.

The repo at each input URL generally has its own `flake.nix` file. Nix
automatically downloads inputs (according to git revisions specified in
`flake.lock`), recursively evaluates `flake.nix` in each input, and the
`outputs` from each input to the `outputs` function in our flake.[^1]

`outputs` has this form:

```nix
outputs =
  { self          # │ outputs function takes a dictionary / attribute set
  , nixpkgs       # │ as a parameter which we destructure to access the attributes
  , rust-overlay  # │ `self`, `nixpkgs`, `rust-overlay`, `systems`
  , systems       # │
  }:              # │ Note the colon! That signals the start of the function body
  let
    makePkgs = /* ... */;       # │
    perSystem = /* ... */;      # │ local variable bindings
    rustToolchain = /* ... */;  # │
  in
  {                         # │
    devShells = /* ... */;  # │ The dictionary / attribute set that outputs returns 
  };                        # │
```

`self` is a special self-reference: it is the return value of `outputs`. Nix can
do that because of lazy evaluation.

[^1]: I'm glossing over the fact that the attributes given to `outputs` are
    **derivations**. I thought that would be unnecessary detail for this post.

### `perSystem`

The flake is supposed to work on multiple systems, where a "system" is
a combination of operating system and CPU architecture. Every time you see the
variable `system` in our flake it represents a string like `"x86_64-linux"` or
`"aarch64-darwin"` for Apple Silicon Macs. It's not uncommon to have some
differences in devshell configuration from system to system. So instead of
defining one devshell we actually need to define a devshell configuration for
each system that we want to support. In our case the definitions are all the
same so we use a shortcut to do that.

The `perSystem` helper defines an attribute set with an attribute for each
system in the `systems` flake input. So this expression:

```nix
devShells = perSystem (pkgs: {
  default = /* ... */;
});
```

evaluates to,

```nix
devShells = {
  aarch64-darwin.default = aarch64-darwin-pkgs: /* ... */;
  aarch64-linux.default = aarch64-linux-pkgs: /* ... */;
  x86_64-darwin.default = x86_64-darwin-pkgs: /* ... */;
  x86_64-linux.default = x86_64-linux-pkgs: /* ... */;
});
```

{% info() %}
A flake can actually define multiple devshells with different names. This flake
happens to define just one devshell for each system named `default`. It happens
that `nix develop` and direnv apply the devshell named `default` unless given
a different name.
{% end %}

You can see all of your flake outputs after evaluation by running,

```sh
$ nix flake show
```

You can also see outputs for remote flakes. For example,

```sh
$ nix flake show github:NixOS/nixpkgs/nixpkgs-unstable
```

{% info() %}
For details on the use of the `github:nix-systems/default` input see the
[systems pattern](https://github.com/nix-systems/nix-systems).
{% end %}

### nixpkgs, pkgs, makePkgs

Nixpkgs provides a huge set of packages. Before we can access packages we need
a packages instance that is instantiated for a specific system, such as for
`x86_64-linux`, or for `aarch64-darwin`. It is customary to assign such an
instantiated package set to a variable called `pkgs`.

It happens that the `nixpkgs` flake defines an output called `legacyPackages`
that provides attributes with instantiated package sets for a large number of
systems. For example `nixpkgs.legacyPackages.x86_64-linux` is the set of amd64
Linux packages.

{% note() %}
Don't worry about the word "legacy". It doesn't imply deprecation.
The `legacyPackages` flake output is distinguished from the `packages` output
for [reasons](https://github.com/NixOS/nixpkgs/blob/b2e41a5bd20d4114f27fe8d96e84db06b841d035/flake.nix#L47).
{% end %}

A package set from nixpkgs comes with a method, `.extend`, that modifies the
package set using an [overlay][], which is a function with a specific signature.
The bit, `.extend rust-overlay.overlays.default` extends nixpkgs with an
additional package called `rust-bin` that is defined by `rust-overlay` which we
use later. (Remember that a space between expressions means function
invocation.)

[overlay]: https://nixos.org/manual/nixpkgs/stable/#chap-overlays

This is all tied together in `makePkgs` which is a helper function that produces
a package set for each system that we want to support:

```nix
  makePkgs = system:  nixpkgs.legacyPackages.${system}  .extend rust-overlay.overlays.default;
#            ──────   ────────────────────────────────  ─────────────────────────────────────
#              ↑                   ↑                                   ↑
# system string argument           │                                   │
#                                  │                                   │
#             instantiated package set for the given system            │
#                                                                      │
#                                                     extend the package set to add `rust-bin`
```

`perSystem` calls `makePkgs` to define `pkgs` for each system, which `perSystem`
passes to its callback argument.

### rust-overlay

Our flake creates a Rust toolchain package by calling `rust-bin`. As discussed
in the previous section, `rust-bin` is added to `pkgs` via an overlay.

```nix
rustToolchain = pkgs: pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
```



We define `pkgs` with an [overlay][] that adds `rust-bin` to `pkgs`. `rust-bin` is not a [derivation][] by itself - it is a set of Nix functions that will each produce a [derivation][] with the requested toolchain.

[derivation]: /nix/derivation

In the minimal example we listed the specific packages `pkgs.rustc` and `pkgs.cargo`. But in this example we only list `rustToolchain`. That is because `rustToolchain` is a dynamically-defined [derivation][] that includes all of the requested toolchain components. That means that the devShell will automatically include `rustc`, `cargo`, and `rustfmt` (because rustfmt is listed in the toolchain components).

### Options for Specifying a Toolchain

The example above defines a toolchain this way,

```nix
rustToolchain = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;
```

The advantage of reading configuration from `rust-toolchain.toml` is that [rustup][] will also read this file so if you have collaborators who prefer to use rustup instead of Nix then everyone will still get the same toolchain.

If you prefer, instead of using a `rust-toolchain.toml` file you can define your toolchain parameters directly in `flake.nix`. For example, to follow the latest stable toolchain with a default set of components use:

```nix
rustToolchain = pkgs.rust-bin.stable.latest.default
```

The specific toolchain version will be fixed in `flake.lock`. So even if the toolchain version is given by the non-specific term "stable" you can be assured that everyone using this dev environment will have the same Rust version. When a new stable release comes out you get it by updating the rust-overlay flake input.

{% warning() %}
You will need to update rust-overlay to use new Rust releases that have come out since you last updated. To do that run,

`$ nix flake lock --update-input rust-overlay`
{% end %}

There are lots more granular options for specifying toolchains. For details see the [rust-overlay][] documentation.
