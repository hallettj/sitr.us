+++
title = "Embedded SQL highlighting in Neovim, a look into Treesitter, and some NixOS patching"
date = 2026-05-03
path = "2026/05/03/embedded-sql-highlighting-in-neovim"

[taxonomies]
tags = ["Neovim", "Treesitter", "Nix", "Rust"]

[extra]
toc_ignore_pattern = "Table of Contents"
toc_levels = 2
+++

This is the story of the rabbit hole I went down because I wanted pretty syntax highlighting for embedded SQL queries in my Rust code.
I'm a fan of [sqlx](https://github.com/launchbadge/sqlx/blob/main/README.md), which provides macros for writing inline SQL with real-time type checking.
Because the queries are in Rust strings the whole query is highlighted uniform green by default.
That's not acceptable!
By the end of my journey I had highlighting looking like this:

{{ responsive_image(
  src_1x="embedded-sql-query_12pt.png"
  src_2x="embedded-sql-query_24pt.png"
  alt="let user_id = sqlx::query_scalar!(
    r#&quot;select id as &quot;id!&quot; from users where provider = ? and provider_id = ?&quot;#,
    provider,
    provider_id
)
.fetch_one(&mut *tx)
.await?;"
) }}

In most cases this kind of embedded syntax highlighting is easy in Neovim,
and it's often set up by default if you use the nvim-treesitter plugin.
But I ran into some issues in this particular case.
That led me to learn some things about Treesitter,
and about how nixpkgs packages Neovim plugins, and Treesitter packages.
If you care to follow along, you'll hear a tale of Neovim, Treesitter, injection queries, patching, NixOS, and more patching!

<!-- more -->

## Table of Contents

<!-- toc -->

## A little background on Treesitter

I could go on for paragraphs about what Treesitter is, and why it's great. Briefly Treesitter gives code editors an AST for the code in the buffer. That gives more accurate syntax highlighting and indentation than the traditional regular expression method. But there's a lot more you can do when you have an AST! For example you get syntax-aware editing shortcuts.

{% info() %}
Treesitter originated in Zed. It has become a standout feature of Neovim. And also Helix! And, as I'm now learning, Emacs!
{% end %}

One of the magic things that Treesitter provides is **injections**. 
These allow you to target certain AST nodes to apply syntax highlighting for a language that is different than the language in the rest of the file.
The Neovim plugin nvim-treesitter, in addition to supplying syntax highlighting, provides a stock set of injection queries for each language.
Sometimes you can get an injection explicitly by putting a comment with a language tag before a string, like this:

{{ responsive_image(
  src_1x="language-tag_12pt.png"
  src_2x="language-tag_24pt.png"
  alt="let x = /* sql */ &quot;select * from users&quot;;"
) }}

Whether that works depends on whether nvim-treesitter has the injection query configured for the parent language you're working with.
It works in Nix files at least.[^comment-tag]

[^comment-tag]: The injection query configured in Nix that makes tagging a string with a comment work is defined [here](https://github.com/nvim-treesitter/nvim-treesitter/blob/4916d6592ede8c07973490d9322f187e07dfefac/runtime/queries/nix/injections.scm#L4). You can copy that to use in other languages with slight modifications. For example other languages might use a node name like `string_literal` instead of `string_expression`, and `string_content` instead of `string_fragment`.

The stock queries for most languages have some useful injections.
Rust has injections for regex literals, re2c block comments, and for slint, html, json, and xml macros.
Here is syntax highlighting for a JSON value in Rust code:

{{ responsive_image(
  src_1x="json-injection_12pt.png"
  src_2x="json-injection_24pt.png"
  alt="let data = serde_json::json!({ 
    &quot;foo&quot;: 1,
    &quot;bar&quot;: &quot;two&quot;,
    &quot;baz&quot;: true,
});"
) }}

{% info() %}
Injections also make Rust macro highlighting look mostly correct.
Certain macro bodies are not technically Rust code - they are token trees.
The nvim-treesitter queries use injections to apply Rust highlighting anyway.
{% end %}

If a language doesn't come preconfigured with the injection you want,
you can write one yourself, and put it in your Neovim config.

## The sqlx injection query

I wanted to add an injection for SQL query macros in Rust.
So I put this injection query in my Neovim config in
[after/queries/rust/injections.scm](https://github.com/hallettj/home.nix/blob/71199814c4dc78ae052b0405c7aa482f133df821/modules/features/neovim/nvim-config/after/queries/rust/injections.scm):

```fennel,name=after/queries/rust/injections.scm
;extends

; ↑ that ;extends pragma is important!

; apply sql syntax highlighting string literal argument of sqlx::query()
(macro_invocation                             ; match a macro invocation
  macro: (scoped_identifier                   ; the macro has to be identified with a scoped identifer, of the form module::identifier
    path: (identifier) @_macro_path           ; label the macro's module name / path node for later reference
    name: (identifier) @_macro_name)          ; label the macro's identifier node for later reference
  (token_tree                                 ; the macro should have a token tree argument, because it's a macro
    .                                         ; the dot operator anchors to the first sibling, which targets the first macro argument
    [                                         ; match a case where the token tree's first child is either a string or a raw string literal
    (string_literal
      ((string_content) @injection.content))  ; in either case declare the content (the part inside the quotes) is the injection content
    (raw_string_literal
      ((string_content) @injection.content))
    ])
  (#eq? @_macro_path "sqlx")                   ; match only if the macro's module name is "sqlx"
  (#match? @_macro_name "query(_as|_scalar|)") ; match only if the identifier is one of sqlx's query macro names
  (#set! injection.language "sql"))            ; set the injection language to "sql"
```

Treesitter queries are written using S-expressions, which might be familiar if you've worked with Lisp.
The rough idea is that you are writing the AST structure that you want the query to match.
Queries are mostly of the form `(<ast node name> ...<child node>)`.
You can label a node to refer to it later in the query using a label with a `@` prefix adjacent to the target node.
There are some special labels, like `@injection.content` and `@injection.language`.
The other labels here, `@_macro_path` and `@_macro_name`, are arbitrary names.
There are also predicates (`#eq` and `#match`) to filter matches, and directives (`#set`) which set metadata.
You can learn about queries by running `:h treesitter` in Neovim,
or by looking at the [online documentation](https://neovim.io/doc/user/treesitter/).

{% tip() %}
It's a little tricky to learn how to write queries.
What is super helpful for this are Neovim's AST inspector, and interactive query editor.
In your code file run, `:InspectTree` which opens a panel that shows you the parsed AST for the file.
Run the command `:EditQuery` to open another panel where you can write test queries.
Placing the cursor over labels in your query will highlight matches in the file which shows you whether your query works as expected.
{% end %}

My sqlx query matches the query macros that I want to target, and applies SQL highlighting to the string content of the first macro argument.
It only matches uses of the macro that are qualified with the `sqlx` path, as in `sqlx::query!(...)`.
And that's all it takes!
Usually.
In this case I had two problems:

1. Semantic highlighting from the LSP server overrides Treesitter highlighting.
So I would see the SQL syntax highlighting for a second after opening the editor,
but once the LSP loaded the SQL queries would go back to uniform green.
2. After I tackled problem 1, the injection highlighting was fighting with the stock Rust string highlighting.
It seemed to be random when I opened the editor whether I would get the highlighting I wanted,
or uniform green string highlighting.

## A little background on semantic highlighting

Yes, there is a third way code can be highlighted.
After regex-based syntaxes, and Treesitter highlight queries, your editor can get syntax highlighting directly from an LSP server.
Many LSPs support this feature, but not all.
What's neat about that is the LSP has information about tokens in the code that can't be deduced from syntax alone.
In Rust, semantic highlighting makes struct names and trait names slightly different colors.

{{ responsive_image(
  src_1x="semantic-highlighting_12pt.png"
  src_2x="semantic-highlighting_24pt.png"
  alt="use std::vec::Vec;        // struct
use std::iter::Iterator;  // trait"
) }}

Pretty cool!

Neovim highlights have priorities.
Highlights set by Treesitter have priority 100 by default.
Semantic highlights have priority 125 by default.
The higher number wins, so semantic highlights override Treesitter highlights.

Here is the output I see from running the `:Inspect` Neovim command one one of the tokens in my embedded SQL query:

```
Treesitter                                                                                                                     
  - @string.rust links to String   priority: 100   language: rust                                                              
  - @keyword.sql links to Keyword   priority: 100   language: sql                                                              
  - @string.rust links to String   priority: 100   language: rust                                                              
                                                                                                                               
Semantic Tokens                                                                                                                
  - @lsp.type.string.rust links to String   priority: 125                                                            
  - @lsp.mod.macro.rust links to @lsp   priority: 126                                                                          
  - @lsp.typemod.string.macro.rust links to @lsp   priority: 127
```

Some LSPs are surgical about semantic highlighting, only setting highlight for cases where semantic analysis adds information that is not available in syntax.
But rust-analyzer sets semantic highlights for every token in the file, including string literals.

## Fixing semantic highlighting priority

So the semantic string highlight clobbered my Treesitter injection SQL query highlighting.
The simplest way to work around this is to disable semantic highlighting.
If you're using rustacean.nvim to configure rust-analyzer then you can do that like this:

```lua
vim.g.rustaceanvim = {
    on_attach = function(client, bufnr)
      -- Disable semantic highlighting in Rust
      client.server_capabilities.semanticTokensProvider = nil
    end,
  }
}
```

But what I really want is to only disable semantic highlighting for string literals.
The way I did that was to set that highlight to be transparent:

```lua
-- A better fix!
vim.api.nvim_set_hl(0, "@lsp.type.string.rust", {})
```

Or this can be applied to all languages:

```lua
vim.api.nvim_set_hl(0, "@lsp.type.string", {})
```

## A little background on highlights and highlight groups

In Neovim a **highlight group** is a named set of colors and styles.
A **highlight** applies a specified highlight group to a specified range of text, with a priority.

When multiple highlights are applied to the same token,
Neovim applies the colors and styles of each referenced highlight group in priority order.
Changing the highest priority group, `@lsp.type.string.rust`, so that it doesn't set any colors 
causes the editor to use colors from the lower priority group.

Another detail is that in the stock Neovim configuration a number of highlight groups **link** to other groups by default.
In this case `@lsp.type.string.rust` links to `String` by default.
That means that any highlight with the group `@lsp.type.string.rust` will apply all of the highlight settings configured for the `String` group.
The string highlight group from the Rust Treesitter queries, `@string.rust`, also links to `String`.
That gets you consistent highlighting for strings regardless of whether the highlighting comes from Treesitter or from the LSP.
Giving explicit highlight settings for `@lsp.type.string`, like I did in the last section, overrides the default link;
so in my setup `@lsp.type.string` no longer links to `String`.

## Problem: Treesitter string highlighting sometimes overrides injection highlighting

I expected that setting a language injection for a node would prevent any highlights from the parent language from applying to the injection content node, and it's children.
But it turns out that Neovim applies both the parent language highlights, and the injection language highlights.
The text color you end up with depends on priorities.

As I said previously, Neovim highlights have priorities.
All Treesitter highlights, including language injections, have priority 100 by default.
My SQL injection highlighting wound up having equal priority with the Rust string highlight.
Neovim seemed to pick a winner at random every time I started the editor -
half the time the highlighting would be correct, half the time the entire SQL expression would be green.

Here's that `:Inspect` output again:

```
Treesitter                                                                                                                     
  - @string.rust links to String   priority: 100   language: rust                                                              
  - @keyword.sql links to Keyword   priority: 100   language: sql                                                              
  - @string.rust links to String   priority: 100   language: rust                                                              
```

You can set a custom priority for any highlight in the syntax highlighting queries for a language.
But AFAIK there isn't a way to override the priority of a stock highlight from my own config.
And AFAIK there isn't a way to increase priority of injection highlights from an injection query.

The nvim-treesitter [contributing guide](https://github.com/nvim-treesitter/nvim-treesitter/blob/main/CONTRIBUTING.md) has a couple of notes on best practices for setting highlight priorities on nodes that might be targeted by injections.

> Captures can be assigned a priority to control precedence of highlights via the
`#set! priority <number>` directive (see [`:h treesitter-highlight-priority`](https://neovim.io/doc/user/treesitter.html#treesitter-highlight-priority)). This is useful for controlling conflicts with injected languages or when inheriting queries from other languages.

> ```fennel
> @markup.raw.block  ; literal or verbatim text as a stand-alone block
>                    ; (use priority 90 for blocks with injections)
> ```

The guide doesn't specifically recommend reduced priority for string literals;
but I think that is what is called for in this situation.
I don't know if this was the best solution - but since I couldn't override priorities from my configuration,
my plan for a fix was to patch nvim-treesitter.

## A little background on patching packages in NixOS

One of the wonderful things about Nix is that whether you use NixOS, Home Manager, nix-darwin, or something similar,
it is very convenient to patch upstream packages.
You can put a patch in your configuration, and it gets automatically applied every time you update the patched package.
Here's a simplified version of some patch code from [my config](https://github.com/hallettj/home.nix/blob/6d803252fabe578fa9add21ebfc04a6269e81d6d/modules/overlays/default.nix#L41):

```nix
let
  # a little helper function to make patching easier
  patch = pkg: patches: pkg.overrideAttrs (oldAttrs: {
    patches = (oldAttrs.patches or [ ]) ++ patches;
  });

  pkgs = import inputs.nixpkgs {
    system = "x86_64-linux";
    overlays = [
      (final: prev: {
        starship = patch prev.starship [
          ./starship-ignore-atuin-when-counting-jobs.patch
        ];
      })
    ];
  };
in
# more Nix config...
```

I was already getting the nvim-treesitter from nixpkgs using the package, `pkgs.vimPlugins.nvim-treesitter.withAllGrammars`.
That's the most convenient way to set up Treesitter on NixOS because you get pre-built grammars.
So you don't need to set up dependencies for building grammars through the nvim-treesitter plugin,
like the chumps who install grammars by running `:TSUpdate`.

## Tracking down where to apply my patch

I thought that patching nvim-treesitter would be as simple as the above example.
I came up with the patch I wanted to apply:

```diff,name=make-overlays-to-nvim-treesitter-affect-built-queries.patch
diff --git a/runtime/queries/rust/highlights.scm b/runtime/queries/rust/highlights.scm
index 2342dcfa..2a713e8d 100644
--- a/runtime/queries/rust/highlights.scm
+++ b/runtime/queries/rust/highlights.scm
@@ -227,10 +227,10 @@
 
 (float_literal) @number.float
 
-[
+([
   (raw_string_literal)
   (string_literal)
-] @string
+] (#set! priority 90)) @string
 
 (escape_sequence) @string.escape
```

But unfortunately patching `pkgs.vimPlugins.nvim-treesitter` directly didn't do the trick.
That's because instead of one plugin package, the treesitter parser and query ecosystem is split into many packages.
There is basically a grammar package, and a queries package for each language.
(The grammar is the program that actually parses code to produce ASTs. The queries specify highlight groups, injections, and tags.)
Nvim-treesitter is sort of a monorepo in the sense that it contains queries for supported languages.
But it doesn't contain grammars itself - it has [a list of upstream grammars][grammars].
It's designed to handle installing and building requested grammars through a plugin command.

[grammars]: https://github.com/nvim-treesitter/nvim-treesitter/blob/main/lua/nvim-treesitter/parsers.lua

The Nix packaging is also set up so that you can pick and choose which grammars to install.
But Nix goes a step further and also defines separate packages for the queries for each language.
So what I ultimately need to patch is specifically the `vimplugin-nvim-treesitter-queries-rust` package.
But although there is a package with that name in my `/nix/store`,
there is no such attribute in nixpkgs.
I had to learn about Neovim plugin packaging in Nix,
and more specifically about nvim-treesitter packaging to figure out how to apply my patch.

### Why not submit a PR?

Nvim-treesitter is a tremendous resource for the Neovim community.
It's not exactly a requirement to use Neovim, but it's something that nearly all Neovim users want to use.
But it's a lot of work to maintain, and its prominence puts it under particular scrutiny.
A few weeks ago, as of this writing, the author apparently got fed up with the latest badgering from some community members,
and decided they were done.
They stopped development, and set the nvim-treesitter repo to read-only.
I respect the author's decision to quit -
stepping up to a public service shouldn't be a lifetime sentence!
But it does mean that the Treesitter situation is a little uncertain right now, and I don't know where to send a PR.

{% info() %}
There is a discussion of how to manage Treesitter parsers and queries in [this Neovim issue](https://github.com/neovim/neovim/issues/39006).
There are also a few plugins that have popped up to try to fill in the gap left by nvim-treesitter.
{% end %}

## A little background on how Nix packages Neovim plugins

There are some details about packaging in the [nixpkgs docs](https://github.com/NixOS/nixpkgs/blob/6ae75fb20424672b3a96a09644abf02c286f3c1f/doc/languages-frameworks/vim.section.md#adding-new-plugins-to-nixpkgs-adding-new-plugins-to-nixpkgs).
Nixpkgs put Neovim plugins in a nested package set in `pkgs.vimPlugins`.
That set is defined in nixpkgs source in [pkgs/applications/editors/vim/plugins/default.nix](https://github.com/NixOS/nixpkgs/blob/1c3fe55ad329cbcb28471bb30f05c9827f724c76/pkgs/applications/editors/vim/plugins/default.nix).
It is defined by a list of overlays.
The two significant overlays to look at for this case are the [generated](https://github.com/NixOS/nixpkgs/blob/1c3fe55ad329cbcb28471bb30f05c9827f724c76/pkgs/applications/editors/vim/plugins/generated.nix#L12547) set,
and [overrides](https://github.com/NixOS/nixpkgs/blob/08637f1007961f837338534caba611b593dcab93/pkgs/applications/editors/vim/plugins/overrides.nix#L134).
There is a list of plugin repos in a file, [vim-plugin-names](https://github.com/NixOS/nixpkgs/blob/6ae75fb20424672b3a96a09644abf02c286f3c1f/pkgs/applications/editors/vim/plugins/vim-plugin-names#L8).
A Python script reads that file, fetches information about the latest revisions, and writes the Nix expression for the generated package set.
The overrides overlay makes modifications to apply any special configuration that each plugin might need.

The whole `vimPlugins` set is fed to the function `lib.makeExtensible` which adds an `extend` method.
That means that, like with the top-level nixpkgs set,
users like me can apply an overlay to the plugin package set by calling `pkgs.vimPlugins.extend myOverlay`.

## A little background on how Nix packages Treesitter grammars and queries

The Nixpkgs source has a bunch of special handling for Treesitter plugins because nvim-treesitter fans out into lots of individual plugin packages,
and because it references grammars that have to be compiled.
In fact nvim-treesitter has its own [generated](https://github.com/NixOS/nixpkgs/blob/8c70e6705164762d3a595a36ba901f290ea162f2/pkgs/applications/editors/vim/plugins/nvim-treesitter/generated.nix) package set.

The overrides expression I mentioned in the previous section invokes [special configuration](https://github.com/NixOS/nixpkgs/blob/1c3fe55ad329cbcb28471bb30f05c9827f724c76/pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix) for nvim-treesitter.
That expression defines grammar packages which are placed in `pkgs.vimPlugins.nvim-treesitter.builtGrammars`,
and queries which are placed in `pkgs.vimPlugins.nvim-treesitter.queries`.
So the package I'm interested in patching has an attribute at `pkgs.vimPlugins.nvim-treesitter.queries.rust`.

But instead of referencing the `buildGrammars` and `queries` attributes,
the intention for end users is to specify the grammars and queries you want with a package expression something like this:

```nix
plugins = with pkgs.vimPlugins; [
  nvim-treesitter.withPlugins (p: [ p.rust ])
];
```

Or to install all the grammars and queries with `pkgs.vimPlugins.nvim-treesitter.withAllGrammars`.

## How query packages are defined

Let's take a closer look at how those query packages are built.
It's handled in a function called [buildQueries](https://github.com/NixOS/nixpkgs/blob/1c3fe55ad329cbcb28471bb30f05c9827f724c76/pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix#L20).
Here's a trimmed-down version of the expression that configures nvim-treesitter so you can see what's going on:

```nix,name=pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix,hl_lines=29-30
{
  vimUtils,
  # ... other nixpkgs dependencies
}:

self: super:

let
  buildQueries =
    {
      language,
      requires ? [ ],
    }:
    vimUtils.toVimPlugin (
      # Just mkdir + ln -s; cheaper to build than to substitute (and not
      # on cache.nixos.org anyway since release.nix doesn't recurse into
      # passthru.queries). With ~300 languages under withAllGrammars,
      # round-tripping each to a remote builder is very slow.
      runCommandLocal "nvim-treesitter-queries-${language}"
        {
          passthru = {
            inherit language requires;
            isTreesitterQuery = true;
          };
          meta.description ="Queries for ${language} from nvim-treesitter";
        }
        ''
          mkdir -p "$out/queries"
          if [ -d "${super.nvim-treesitter.src}/runtime/queries/${language}" ]; then
            ln -s "${super.nvim-treesitter.src}/runtime/queries/${language}" "$out/queries/${language}"
          else
            echo "Error: there are no queries for ${language}."
            exit 1
          fi
        ''
    );

    # ...
```

(This is from nixos-unstable, which I expect will shortly become nixos-26.05.)

The overrides overlay applied to `pkgs.vimPlugins` delegates to this function.
So `self` and `super` reference `pkgs.vimPlugins` at two points in the application of overlays.
You can see here that a queries package is a symlink to a subdirectory in the nvim-treesitter source.
So a patch to nvim-treesitter should propagate to the queries package that I want to target.
But there are two caveats:

1. The usual process for patching a package is to set a `patches` attribute on the package derivation. That applies the patch during the derivation's "patch" phase. But that is a build time step. Patching this way doesn't affect the `src` attribute of the derivation. The queries package links to the source derivation, not to the plugin derivation. So traditional patching won't work.
2. Nvim-treesitter source is referenced through `super`, which references the `vimPlugins` package set as it exists _before_ the current overlay is applied. If I patch nvim-treesitter in my own overlay that will apply _after_ this one. So `buildQueries` won't see my patch.

## A little background on Nix overlays

An overlay is a function that transforms a package set.
Package sets are often modified by multiple overlays - each overlay applies to the output of the previous one.
It traditionally has the form `final: prev: { /* modifications */ }` or `self: super: { /* modifications */ }`
depending on which parameter name convention you prefer.
There are two parameters there.
The second parameter, `prev` or `super`, references the output of the previous overlay (or the original set if it's the first overlay).
The first parameter, `final` or `self`, is a **fixed point**.
It is a reference to the package set _after all overlays_ have been applied.
It's sort of a reference to the future!
It's possible because of lazy evaluation,
and works as long as there are no expressions that require evaluating their own final state.
That would be a paradox, and leads to an "infinite recursion" error message.

What's great about the fixed point pattern is that it eliminates a lot of order dependency issues between overlays.
You should always use `final` when you can, and only use `prev` if you have to to avoid infinite recursion.

For example, lets say you want to fix a program's interpreter to a certain Python version, like v3.13.

```nix
final: prev: {
  someProgram = prev.someProgram.override {
    python = final.python313;
  }
}
```

It's best to use `final` to reference the Python package in case there is some other overlay that modifies `python313`.
Using final means you get the same result regardless of which order this and the other overlay are applied.
But it's necessary to use `prev` to customize `someProgram` because `someProgram = final.someProgram` would be the kind of self-reference that leads to infinite recursion.

Fixed points are a major reason why Nix uses its own programming language instead of something more mainstream.
You also see fixed points in the `self` input to a flake's output function,
and in the `config` input to NixOS modules.
These concepts only work in a lazily-evaluated language.

## Now I have to patch nixpkgs

Because query packages reference `super.nvim-treesitter` I can't get my patch in where I need it.
What I need is to change `buildQueries` to reference `self.nvim-treesitter`.
That will take advantage of the fixed point so that even though the overlay with my patch applies after the one that defines `buildQueries`,
it will still pick up modifications from my overlay.

But that means it's not sufficient to merely patch packages with overlays.
I'm at a point where I have to patch the nixpkgs source itself!

This is the patch I want to apply:

```diff,name=nvim-treesitter_reduce-string-priority.patch
diff --git a/pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix b/pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix
index 092fbfb5a..9ae93e272 100644
--- a/pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix
+++ b/pkgs/applications/editors/vim/plugins/nvim-treesitter/overrides.nix
@@ -37,8 +37,8 @@ let
         }
         ''
           mkdir -p "$out/queries"
-          if [ -d "${super.nvim-treesitter.src}/runtime/queries/${language}" ]; then
-            ln -s "${super.nvim-treesitter.src}/runtime/queries/${language}" "$out/queries/${language}"
+          if [ -d "${self.nvim-treesitter.src}/runtime/queries/${language}" ]; then
+            ln -s "${self.nvim-treesitter.src}/runtime/queries/${language}" "$out/queries/${language}"
           else
             echo "Error: there are no queries for ${language}."
             exit 1
```

Nixpkgs provides a helper that will be useful here: `applyPatches`.
Because `applyPatches` is a package in Nixpkgs this will require some bootstrapping.

```nix
nixpkgs = inputs.nixpkgs.legacyPackages.${system}.applyPatches {
  name = "nixpkgs";
  src = inputs.nixpkgs;
  patches = [
    ./make-overlays-to-nvim-treesitter-affect-built-queries.patch
  ];
};

pkgs = import nixpkgs {
  inherit system;
};
```

This two-step process of patching the nixpkgs input, and then importing it is an **import from derivation** (IFD) which messes up parallel evaluation of the Nix configuration.
But I don't have a problem with that in my personal config.

A little background on import from... actually I'll just link to [the manual](https://nix.dev/manual/nix/2.34/language/import-from-derivation).

### Why not submit a PR?

I will! I promise!

## Finally applying the nvim-treesitter patch

Ok, I have my patch, and I've fixed nixpkgs so that I have somewhere to apply it.
I can finally apply the patch like this:

```nix
let
  # patch via an overlay
  nvim-treesitter-overlay = final: prev: {
    vimPlugins = prev.vimPlugins.extend (
      # vimPlugins is a nested package set so it needs an overlay
      # within an overlay
      plugins-final: plugins-prev: {
        nvim-treesitter = plugins-prev.nvim-treesitter.overrideAttrs (
          oldAttrs: {
            src = final.applyPatches {
              src = oldAttrs.src;
              patches = [
                ./nvim-treesitter_reduce-string-priority.patch
              ];
            };
          }
        );
      }
    );
  };
in
pkgs = import inputs.nixpkgs {
  system = "x86_64-linux";
  overlays = [ nvim-treesitter-overlay ];
};
```

As previously mentioned, I can't apply the patch using the usual process of
setting a `patches` attribute in `overrideAttrs` because the query packages link
to nvim-treesitter's `src` attribute, not to the nvim-treesitter package itself.
So I have to patch the plugin source, and override the `src` attribute instead.

{% info() %}
Why do queries link to the `src` attribute instead of to the nvim-treesitter package?
As far as I can tell from looking at the closure for the nvim-treesitter
package, it depends on the runtime dependencies for all grammars.
OTOH the plugin source has no dependencies.

It turns out that installing `pkgs.vimPlugins.nvim-treesitter.withAllGrammars`
or `pkgs.vimPlugins.nvim-treesitter.withPlugins (/* ... /*)` does not install
`pkgs.vimPlugins.nvim-treesitter` itself.
So avoiding referencing the nvim-treesitter package itself in the query packages
avoids some dependencies that you don't need if you're installing grammars
selectively with `withPlugins`.
{% end %}

And this works! Finally my SQL expressions are no longer boring!
My final patch configuration is [here](https://github.com/hallettj/home.nix/blob/71199814c4dc78ae052b0405c7aa482f133df821/modules/features/neovim/treesitter-fixes/default.nix).
It uses the dendritic pattern to use one module to apply both patches.

## One last problem: some SQL query tokens are still green

The SQL highlighting I'm using uses the "normal" text color for some tokens, like the column names in an insert statement.
It does that by not assigning any highlight.
Tokens that are not specifically highlighted use the normal text color by default.
But because my SQL queries are highlighted by injection, they also have the Rust string highlight applied.
So the tokens that are supposed to be white are actually green.

I fixed that by putting this query in
[after/queries/sql/highlights.scm](https://github.com/hallettj/home.nix/blob/71199814c4dc78ae052b0405c7aa482f133df821/modules/features/neovim/nvim-config/after/queries/sql/highlights.scm):

```fennel,name=after/queries/sql/highlights.scm
;extends

((_ (#set! priority 95)) @markup.normal)
```

And I configured the `@markup.normal` highlight group to use normal text color:

```lua
vim.api.nvim_set_hl(0, "@lsp.type.string", { link = "Normal" })
```

The priority 95 is higher than what I configured for Rust strings, but lower than the default priority for the injection highlighting.

## A little background on what has been accomplished

I have syntax highlighting for my embedded sqlx queries that works every time I start the editor!

To make the injection highlighting work at all what I had to do was to put the injection query in my configuration,
and disable semantic highlighting for strings.

To make injection highlighting work consistently I had to reduce the priority of Rust string highlights.
That required patching nvim-treesitter.

Thanks for following my journey!
Or I apologize, depending on how you're feeling after reading 4400 words on a yak shaving exercise.
