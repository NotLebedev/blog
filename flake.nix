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

          (python312.withPackages (
            python-pkgs: with python-pkgs; [
              pydantic
              typer
              pillow
              pyyaml
              pytest

              types-pyyaml
              types-pillow
            ]
          ))

          mypy
          ruff
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          inherit nativeBuildInputs;
        };

        packages.default = pkgs.buildNpmPackage {
          name = "blog";

          src = self;
          npmDepsHash = "sha256-wiuVKRqAfp5xB5OXMri5OC/Vz6oyw5n5rEhBt71vT00=";

          buildPhase = ''
            npm run build
            python3 tools/database.py build
          '';

          installPhase = ''
            mkdir $out
            cp -r dist/* $out
            cp netlify.toml $out
          '';

          inherit nativeBuildInputs;
        };

        checks =
          let
            common = {
              src = self;
              buildPhase = "";
              doCheck = true;
              dontBuild = true;
              installPhase = "mkdir $out";
              inherit nativeBuildInputs;
            };
            mkArgs = args: (args // common);
          in
          {
            eslint = pkgs.buildNpmPackage (mkArgs {
              name = "eslint-check";
              npmDepsHash = "sha256-wiuVKRqAfp5xB5OXMri5OC/Vz6oyw5n5rEhBt71vT00=";

              checkPhase = ''
                npx eslint src
              '';
            });

            mypy = pkgs.stdenvNoCC.mkDerivation (mkArgs {
              name = "mypy-check";

              checkPhase = ''
                mypy tools
              '';
            });

            ruff = pkgs.stdenvNoCC.mkDerivation (mkArgs {
              name = "mypy-check";

              checkPhase = ''
                ruff check tools
              '';
            });

            ruff-format = pkgs.stdenvNoCC.mkDerivation (mkArgs {
              name = "mypy-check";

              checkPhase = ''
                ruff format --diff tools
              '';
            });
          };
      }
    );

}
