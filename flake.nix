{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/x86_64-linux";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs =
    {
      self,
      flake-utils,
      nixpkgs,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        nativeBuildInputs = with pkgs; [
          nodejs
          nodePackages.typescript
          nodePackages.typescript-language-server

          cocogitto
        ];
        npmDepsHash = "sha256-ANNbKxsYaS1cAdlKJVpxhqITqnZo/Ziz8+/acpSfLuM=";
      in
      {
        devShells.default = pkgs.mkShell {
          inherit nativeBuildInputs;
        };

        packages.default = pkgs.buildNpmPackage {
          name = "blog";

          src = self;

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir $out
            cp -r dist/* $out
            cp netlify.toml $out
          '';

          inherit nativeBuildInputs npmDepsHash;
        };

        checks =
          let
            common = {
              src = self;
              buildPhase = "";
              doCheck = true;
              dontBuild = true;
              installPhase = "mkdir $out";

              inherit nativeBuildInputs npmDepsHash;
            };
            mkCheck = args: pkgs.buildNpmPackage (args // common);
          in
          {
            eslint = mkCheck {
              name = "eslint-check";

              checkPhase = ''
                npx eslint src
              '';
            };
            tsc = mkCheck {
              name = "eslint-check";

              checkPhase = ''
                tsc
              '';
            };
          };
      }
    );

}
