{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, systems, rust-overlay }:
    let
      perSystem = callback: nixpkgs.lib.genAttrs (import systems) (system: callback (mkPkgs system));
      mkPkgs = system: import nixpkgs { inherit system overlays; };

      overlays = [
        (import rust-overlay)
        (final: prev: {
          # Get Zola v0.19.1
          zola = final.callPackage ./nix/zola.nix {
            # Get newer Rust version to build zola
            rustPlatform =
              let
                rustToolchain = final.pkgsBuildHost.rust-bin.stable."1.79.0".minimal;
              in
              final.makeRustPlatform {
                cargo = rustToolchain;
                rustc = rustToolchain;
              };
          };

          writeNushellApplication = final.callPackage ./nix/writeNushellApplication.nix { };
        })
      ];
    in
    {
      packages = perSystem (pkgs: rec {
        # Program that builds the blog, and writes files to ./public
        build = pkgs.callPackage ./nix/build.nix { inherit decrypt-assets; };
        decrypt-assets = pkgs.callPackage ./nix/decrypt-assets.nix { };
        zola = pkgs.zola;
      });

      devShells = perSystem (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = with self.packages.${pkgs.system}; [
            build
            decrypt-assets
            zola
          ];
        };
      });
    };
}
