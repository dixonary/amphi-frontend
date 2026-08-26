## Development

Install dependencies with `yarn install`, then run `yarn start`.

Vite serves the client on `http://localhost:5173` and proxies `/ws` and
`/auth` to `http://localhost:3201` by default. Override that backend target
with `VITE_SERVER_ORIGIN` in `.env.local`:

```sh
VITE_SERVER_ORIGIN=http://localhost:3201
```

For local GitHub login, configure the backend's
`GITHUB_OAUTH_REDIRECT_URI` as:

```text
http://localhost:5173/auth/github/callback
```

The frontend consumes complete state updates and commands through `/ws`; it
does not require Firebase configuration.
