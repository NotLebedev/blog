## Developing
Project is using nix and npm as package manager. A devshell is provided in `flake.nix`. To start
developing:
1. `direnv allow` to enable automatic devshell initialization on directory entry
  or `nix develop` to enter shell manually.
2. `npm install` to fetch all packages required for project.
3. `npm run dev` to run development server.
