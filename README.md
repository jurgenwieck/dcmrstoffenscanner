# DCMR Inspectie App

Vue 3/Vite frontend voor DCMR-inspecties. De app is voorbereid op Azure-hosting zonder Supabase:

- Azure Static Web Apps voor hosting en Microsoft Entra ID login.
- Een configureerbare DCMR analyse-API via `VITE_DCMR_API_BASE_URL`.
- Azure Logic Apps + Azure AI Foundry Agent voor label/foto-analyse.
- Azure SQL en Blob Storage voor persistente opslag.

Zie `azure/README.md` voor de importvolgorde en Azure-artifacts.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

Gebruik de vastgezette Node.js 24.19.0 LTS-versie (`nvm use`). TypeScript is
vastgezet op 6.0.3, omdat `vue-tsc` en `typescript-eslint` TypeScript 7 in deze
dependencycombinatie nog niet ondersteunen. Werk deze versies pas bij nadat de
volledige build, typecontrole en lintcontrole met de nieuwe combinatie slagen.

```sh
npm install
```

Maak lokaal een `.env` op basis van `.env.example`:

```sh
VITE_DCMR_API_BASE_URL=/api
VITE_DISABLE_AUTH=true
```

Gebruik `VITE_DISABLE_AUTH=true` alleen lokaal. In Azure Static Web Apps loopt login via `/.auth/login/aad`.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

Build output staat in `dist`.

### Azure Static Web Apps

Gebruik deze buildinstellingen:

```text
App location: /
API location: leeg of gekoppeld via APIM/Logic App
Output location: dist
Build command: npm run build
```

`public/staticwebapp.config.json` bevat routebeveiliging voor `/app/*` en SPA fallback voor Vue Router.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
