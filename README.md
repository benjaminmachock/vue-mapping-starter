# Vue + Mapping Practice

Companion project for `../../notes/training_curriculum.md`. Vue 3 + Vite, with Leaflet wired up
out of the box (no API key needed) and an optional Google Maps tab.

## Run it

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Six tabs, one per curriculum exercise:

1. **Reactivity** — `ref`/`computed` warm-up (`src/components/Counter.vue`)
2. **Leaflet Map** — your first working map, marker, popup, cleanup-on-unmount
   (`src/components/BasicMap.vue`)
3. **Layers + GeoJSON** — props/emits driving map layers, `L.geoJSON()`
   (`src/components/LayeredMap.vue`, `src/components/MapLegend.vue`)
4. **Google Maps** — same concepts via the Google Maps JS API (named explicitly in the WSP
   posting). Needs a free API key — copy `.env.example` to `.env.local` and fill it in, or skip
   this tab and lean on tabs 2-3 for the concepts (`src/components/GoogleMap.vue`)
5. **SVG** — click-to-animate SVG, maps to the posting's "motion and interactivity"
   (`src/components/SvgDemo.vue`)
6. **Debounced Search** — live-code practice question from
   `../../notes/technical_interview_questions.md` §3.9 — try rewriting `SearchBox.vue` from
   scratch before looking at it (`src/components/SearchBox.vue`)

Also see `src/composables/useGeolocation.js` for a composable example (Vue's equivalent of a
React custom hook).

## Suggested workflow

Don't just read the components — delete the body of one and rebuild it from memory using the
curriculum doc as reference, then diff against git to see what you missed.

## Next step if you want to go further

Push this to a public GitHub repo once you've made it your own — it covers the "active GitHub
portfolio" preferred qualification and gives you something concrete to walk through in the
interview instead of describing Vue/GIS only in the abstract.
