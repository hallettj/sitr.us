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
          zola = final.callPackage ./zola.nix { };

          # Get newer Rust version to build zola
          rustToolchain = final.pkgsBuildHost.rust-bin.stable."1.79.0".minimal;
          rustPlatform = final.makeRustPlatform {
            cargo = final.rustToolchain;
            rustc = final.rustToolchain;
          };
        })
      ];
    in
    {
      packages = perSystem (pkgs: rec {
        default = public;

        # Website files to deploy to static site hosting.
        # The build requires submodules for this repo, so build with:
        #
        #     nix build .?submodules=1#public
        #
        public = pkgs.stdenvNoCC.mkDerivation {
          name = "sitrus-public";
          src = ./.;
          nativeBuildInputs = [ zola ];

          buildPhase = ''
            zola build --output-dir public
          '';

          installPhase = ''
            mv public $out
          '';
        };

        zola = pkgs.zola;
      });

      devShells = perSystem (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [ zola ];
        };
      });
    };
}
