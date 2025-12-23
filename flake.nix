{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
      ...
    }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      nativeBuildInputs = with pkgs; [
        nodejs_25
        nodePackages.typescript
        nodePackages.typescript-language-server

        cocogitto
      ];
      npmDepsHash = "sha256-XAzDSXub5xLzoUYXosH2Gqy9De0bzOgfoyOB4jFUKJU=";
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        inherit nativeBuildInputs;
      };

      packages.${system}.default = pkgs.buildNpmPackage {
        name = "blog";

        src = self;

        installPhase = ''
          mkdir $out
          tar -cz \
            --sort=name \
            --mtime="@$SOURCE_DATE_EPOCH" \
            --owner=0 --group=0 --numeric-owner \
            --format=gnu \
            -f $out/notlebedev.tar.gz \
            -C dist .
        '';

        inherit nativeBuildInputs npmDepsHash;
      };

      checks.${system} =
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
    };

}
