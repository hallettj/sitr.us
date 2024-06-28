# The devshell setup requires nix-ld if running on NixOS
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    git-format-staged-flake = {
      url = "github:hallettj/git-format-staged";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, systems, git-format-staged-flake }:
    let
      eachSystem = callback: nixpkgs.lib.genAttrs (import systems) (system: callback (pkgs system));
      pkgs = system: nixpkgs.legacyPackages.${system}.extend (final: prev: {
        git-format-staged = git-format-staged-flake.packages.${system}.default;
      });
    in
    {
      devShells = eachSystem (pkgs: {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            autoconf
            git-format-staged
            nodejs
            yarn
          ];
        };
      });
    };
}
