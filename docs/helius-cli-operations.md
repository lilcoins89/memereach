# Helius CLI operations

`helius-cli` is included for developer and deployment-support workflows only. Run it manually from an operator shell or CI job with the required credentials; never invoke it from a browser request, API route, ad-selection path, or campaign operation.

The MVP does not need CLI commands to screen a token or serve an advertisement. Live screening uses the server-side Helius SDK adapter. Any future CLI usage should be audited, rate-limited, and separated from the web runtime.
