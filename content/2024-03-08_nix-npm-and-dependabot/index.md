+++
title = "Nix, NPM, and Dependabot"
date = 2024-03-08
path = "2024/03/08/nix-npm-and-dependabot.html"

[taxonomies]
tags = ["Nix", "TypeScript", "Github", "automatic formatting"]

[extra]
revisions = [
  { date = 2024-03-08, message = "Fixed some typos" },
  { date = 2024-03-08, message = "Change programming language tag for example of writing hash to a file" },
]
+++

I have a project, [git-format-staged][], that I build with Nix.
It includes NPM dependencies, and it is convenient to have [Dependabot][] keep
those up-to-date for me.
Dependabot creates pull requests that update `package-lock.json` when it sees
updates with security fixes and such.
But my Nix configuration includes a hash of the project NPM dependencies -
that hash must be updated when `package-lock.json` changes.
Unfortunately Dependabot does not know how to do that.
So I came up with a workflow to help that bot out.

<!-- more -->

[git-format-staged]: https://github.com/hallettj/git-format-staged
[Dependabot]: https://github.blog/2020-06-01-keep-all-your-packages-up-to-date-with-dependabot/

The hash is in [`test/test.nix`](https://github.com/hallettj/git-format-staged/blob/972b79c242ede25387503e69726efc90830ff545/test/test.nix#L12):

{{ add_src_to_code_block(src="https://github.com/hallettj/git-format-staged/blob/972b79c242ede25387503e69726efc90830ff545/test/test.nix#L12") }}

```nix
let
  npmDeps = fetchNpmDeps {
    inherit src;
    name = "${name}-deps";
    hash = "sha256-44uia9iM9b5IE6RnIxsQSeSC0xHlkZEkIZIDsjbqmzc=";
  };
in
# ...
```

The product of that repo is actually a zero-dependency Python program.
I'm just using Node and NPM to run a test framework (for perfectly-valid reasons).
I have implemented test runs as derivations which means they run in Nix'
sandboxed build environment.
To get reproducibility that means network requests are not allowed unless
I specify the hash of what's going to be downloaded up front.
The hash here is a recursive hash of a directory of downloaded NPM packages that
can be installed later by running `npm install --cache`.

(When I'm working on Rust projects I use [Crane][] which is able to infer
dependency hashes from `Cargo.lock` so I don't need to update a hash in a Nix
expression when dependencies change. I haven't found a tool that does that for
NPM, so for now at least I have this hash to keep up to date.)

[Crane]: https://crane.dev/

## Updating the Hash

So what I want is an automated process that updates that hash when
`package-lock.json` changes.
That means I need to be able to:

1. compute the new dependencies hash
2. update `test/test.nix` with the new hash

There are existing solutions out there for doing this kind of thing.
For example the nixpkgs repo has
[`maintainers/scripts/update.nix`](https://github.com/NixOS/nixpkgs/blob/d1aa2475eb5d4bc33a1a10ded347b7d64d78674c/maintainers/scripts/update.nix).
I did some looking to see if there is something out there that would work for
me.
But then I decided it would be easier to write my own solution.

[`fetchNpmDeps`](https://github.com/NixOS/nixpkgs/blob/d1aa2475eb5d4bc33a1a10ded347b7d64d78674c/pkgs/build-support/node/fetch-npm-deps/default.nix)
is a fetcher in nixpkgs that is specialized for fetching NPM dependencies - 
given a source directory with a `package-lock.json` file it fetches exactly what
you need.
Most Nix fetchers come with a corresponding "prefetch" tool that tells you the
hash of the fetched content.
`fetchNpmDeps` is paired with `prefetch-npm-deps` (defined in the same file) for
that purpose.
I can use `prefetch-npm-deps` for step 1,
and a little sed for step 2.
I ended up with this package definition in my 
[`flake.nix`](https://github.com/hallettj/git-format-staged/blob/972b79c242ede25387503e69726efc90830ff545/flake.nix#L18):

{{ add_src_to_code_block(src="https://github.com/hallettj/git-format-staged/blob/972b79c242ede25387503e69726efc90830ff545/flake.nix#L18") }}
```nix
{
  packages = eachSystem (pkgs: {
    # ...

    # When npm dependencies change we need to update the dependencies hash
    # in test/test.nix
    update-npm-deps-hash = pkgs.writeShellApplication {
      name = "update-npm-deps-hash";
      runtimeInputs = with pkgs; [ prefetch-npm-deps nix gnused ];
      text = ''
        hash=$(prefetch-npm-deps package-lock.json 2>/dev/null) # get the new hash
        echo "updated npm dependency hash: $hash" >&2
        sed -i "s|sha256-[A-Za-z0-9+/=]\+|$hash|" test/test.nix # edit it into the Nix expression
      '';
    };
  });
}
```

Now I can run this command to update the hash automatically:

```sh
$ nix run .#update-npm-deps-hash
```

The script ends up being quite simple,
partly because I only have one hash in `test/test.nix` so it is easy to target
the sed script.
I could keep things cleaner by separating the hashes out into a separate file:

```nix
let
  npmDeps = fetchNpmDeps {
    inherit src;
    name = "${name}-deps";
    hash = builtins.readFile ../npm-deps-hash;
  };
in
# ...
```

In that case the update script would look like this:

```sh
hash=$(prefetch-npm-deps package-lock.json 2>/dev/null) # get the new hash
echo "updated npm dependency hash: $hash" >&2
echo "$hash" > npm-deps-hash
```

## Automation to Help Dependabot

Every one of the Dependabot PRs in my repo was failing required checks because
the PRs updated `package-lock.json`,
but did not update that hash.
So the next step was to set up a Github workflow to run the hash-updating script
after every change from Dependabot.

It would be great if I could configure Dependabot to run a custom shell command
along with its updates.
But as far as I can tell that is not an option.
Instead I added a workflow that runs on pushes to Dependabot's PR branches.
Those all have names of the form `dependabot/npm_and_yarn/*`.
After some research I used this workflow,
[`.github/workflows/dependabot-post.yml`](https://github.com/hallettj/git-format-staged/blob/972b79c242ede25387503e69726efc90830ff545/.github/workflows/dependabot-post.yml):

{{ add_src_to_code_block(src="https://github.com/hallettj/git-format-staged/blob/972b79c242ede25387503e69726efc90830ff545/.github/workflows/dependabot-post.yml") }}

```yaml
# Due to the Nix configuration we need to update a hash in test/test.nix when
# npm dependencies change. This workflow runs on dependabot branches, and runs
# a script that makes the necessary update after each dependabot push.
name: Dependabot-post

on:
  push:
    branches:
      - "dependabot/npm_and_yarn/*" # Run on Dependabot PR branch pushes

jobs:
  update_npm_deps_hash:
    name: Update NPM dependencies hash
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]' || github.actor == 'dependabot-preview[bot]'
    permissions:
      contents: write # This is important! It allows git pushes from this job.
    steps:
      - name: Check Out Code
        uses: actions/checkout@v3

      - name: Install Nix
        uses: DeterminateSystems/nix-installer-action@main

      - name: Configure Cache
        uses: DeterminateSystems/magic-nix-cache-action@main

      - name: Update Hash
        run: nix run .#update-npm-deps-hash # We do the hash update here

      # And then we commit the changes

      - name: Set up Git Config
        run: |
          # Configure author metadata to look like commits are made by Dependabot
          git config user.name "${GITHUB_ACTOR}"
          git config user.email "${GITHUB_ACTOR}@users.noreply.github.com"

      # NOTE: Prefixing/appending commit messages with `[dependabot skip]`
      # allows dependabot to rebase/update the pull request, force-pushing
      # over any changes
      - name: Commit changes
        run: |
          git add .
          # Skip committing or pushing if there are no changes
          if [[ $(git status -s) ]]; then
            git commit -m "build(deps): update npm dependencies hash [dependabot skip]" --no-verify
            git push
            echo "Pushed an update to npm dependencies hash"
          else
            echo "Npm dependencies hash was not changed"
          fi
```

This workflow enables a special permission to allow it to push commits back to
the repo.
That can be dangerous if you have third-party code running because that code
would have access to modify your repository.
Notably NPM packages can run arbitrary code when they are installed.
But that is not an issue here:
`prefetch-npm-deps` does not "install" dependencies so it does not run package
install scripts.
Instead it pre-populates a local cache that can be "installed" later.

Normally Dependabot will refuse to automatically update one of its PRs after
someone else has pushed commits to it.
The workflow includes `[dependabot skip]` in its commit messages to signal to
Dependabot that it is OK to throw those commits out when it recreates or rebases
its PRs.
When that happens the workflow runs again, and re-applies the correct hash.

Note that I don't have to worry about getting into an infinite loop because once
the correct hash is set any subsequent runs will be noops, and so will not
trigger more branch push events.

So now I'm happily automated, and I've been merging a bunch of Dependabot PRs
that I let pile up.

{{ revisions() }}

{{ comments(tootUrl="https://hachyderm.io/@hallettj/113794469314449668") }}
