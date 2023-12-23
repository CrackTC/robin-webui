{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            fish
            caddy
            lsof
          ];

          shellHook = ''
            caddy file-server --listen :8080 --root ./src &
            fish
            exec kill -2 $(lsof -i :8080 -sTCP:LISTEN -t)
          '';
        };
      });
}
