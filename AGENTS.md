# max-personal-site

## Verification

- `node --test tests/site.test.mjs`: starts an isolated local HTTP server and verifies the published root route serves the Chinese portfolio content.
- `node scripts/serve.mjs`: serves the static site for the visual smoke path; inspect it through `skill://omp-chrome` at `http://127.0.0.1:4173/`.
