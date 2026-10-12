<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

const mapContainer = ref(null);
const status = ref("idle");
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

onMounted(async () => {
  let cancelled = false;
  if (!apiKey) {
    status.value = "missing-key";
    return;
  }

  onUnmounted(() => {
    cancelled = true;
  });

  try {
    status.value = "loading";
    //setOptions is an npm package-a loader/wrapper library Google publishes. the real google.maps classes(Map, AdvancedMarkerElement) dont exist anywhere until this loader actually fetches Googles real SDK script and injects it into the page
    setOptions({ key: apiKey, v: "weekly" });

    //fetches Googles SDK over the network. this why this onMounted callback is declared async. Googles API is loaded dynamically, piece by piece, at runtime. the importLibrary is two seperate calls is Google deliberately letting you load on the specific pieces of their large SDK you actually need, instead on one giant bundle - real code splitting at the API level.
    const { Map } = await importLibrary("maps");
    if (cancelled) return;
    const { AdvancedMarkerElement } = await importLibrary("marker");
    if (cancelled) return;

    //Map is the google.maps.Map class - googles equivalent of Leaflets L.map(). Same role(the thing you instantiate to create a map), different shape. L.map(container) is a factory function you call directly, while Googles is a real JS class you construct with new Map(container, options)
    const map = new Map(mapContainer.value, {
      center: { lat: 43.6121, lng: -116.3915 },
      zoom: 12,
      mapId: "DEMO_MAP_ID",
    });

    //Googles current marker class, places a pin at a position with a title(Googles equivalent of Leaflets bindPopup). Advanced because it replacec Googles older, simpler Marker class(now legacy). modern way to drop a pin
    new AdvancedMarkerElement({
      map,
      position: { lat: 43.6121, lng: -116.3915 },
      title: "WSP — Meridian, ID",
    });

    status.value = "loaded";
  } catch (err) {
    console.error(err);
    status.value = "error";
  }
});
</script>

<template>
  <div>
    <h2>Google Maps JS API (named explicitly in the job posting)</h2>
    <p v-if="status === 'missing-key'">
      Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in a
      <code>.env.local</code> file to try this one live (see
      <code>.env.example</code>). The Leaflet and GeoJSON examples cover the
      same concepts without needing a key.
    </p>
    <p v-else-if="status === 'error'">
      Failed to load — check the API key, that the Maps JavaScript API is
      enabled, and billing is set up on the Google Cloud project.
    </p>
    <div
      v-show="status === 'loaded'"
      ref="mapContainer"
      style="height: 400px; width: 100%; border-radius: 8px"
    />
  </div>
</template>

<!-- v-show keeps the div permanently present in the DOM(just visually hidden via CSS, display: none) the whole time, so its always there and ready the instant onMounted needs it. know when to reach for v-show over v-if specifically because of a DOM-availability timing requirement -->
