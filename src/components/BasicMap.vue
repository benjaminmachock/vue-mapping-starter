<script setup>
import { onMounted, onUnmounted, ref } from "vue";
//L is the entire Leaflet library, imported as one object(L.map, L.marker, L.tileLayer) everything Leaflet offers hangs off that L
import L from "leaflet";
//the CSS import is Leaflets own stylesheet - without it, the map renders but looks visually broken(no proper tile layout, broken zoom buttons). pulls in the tools
import "leaflet/dist/leaflet.css";
// Default Leaflet marker icons reference image paths that Vite doesn't
// resolve automatically — this re-wires them. A real "gotcha" you'll hit
// the first time you use Leaflet in a bundler-based project.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

//ref "reactive state I display in the template"

//different use of the same function: a template ref - a way to grab a direct handle to an actual DOM element Vue renders, so you can hand it to a non-Vue library(Leaflet) that needs a real div to draw into. look at div ref="mapContainer" this attribute is Vues way of saying once this div exists in the real dom, store a reference to it in mapContainer.value. Leaflet doesnt know of care about Vue, it just needs a plain DOM element to mount into, and this is how Vue hands it one.

// Counter.vue's ref(0) — you write the code that changes it (count.value++). It holds app data.
// mapContainer = ref(null) — you never assign to it directly. Instead, the ref="mapContainer" attribute on the <div> in the template is what tells Vue "once you render this element, automatically stuff a reference to the real DOM node into mapContainer.value for me." It holds a handle to an actual rendered element, not application data.

// So the distinguishing feature is really the ref="..." attribute in the template — that's the special wiring that makes a ref() into a "template ref" specifically, versus just being state you manage yourself. Same underlying tool, different job.
const mapContainer = ref(null);

//just a plain variable that will hold the Leaflet map instance once created
let map;

//an array of two points to plot - a name and a [latitude, longitude] pair.
const locations = [
  { name: "WSP — Meridian, ID office", coords: [43.6121, -116.3915] },
  { name: "Boise", coords: [43.615, -116.2023] },
];

// Custom marker icon, built from the exact same hand-authored <path> shape
// from SvgDemo.vue — this answers "does the mapping layer create the SVG,
// or do I" directly: here, WE are supplying the SVG, and Leaflet is just
// positioning it on the map.
//
// L.divIcon lets you hand Leaflet a chunk of raw HTML (including inline
// SVG) to use as a marker, instead of its default image-based pin. Leaflet
// doesn't parse or understand the SVG at all — it just drops this HTML into
// a positioned <div> on the map and moves that div around as you pan/zoom.
const customPinIcon = L.divIcon({
  className: "", // prevents Leaflet's default divIcon CSS (a white box) from showing through
  html: `
    <svg viewBox="0 0 100 100" width="40" height="40">
      <path d="M 20,10 L 80,10 L 80,60 L 50,95 L 20,60 Z" fill="crimson" />
    </svg>
  `,
  iconSize: [40, 40],
  // iconAnchor is the pixel point WITHIN the icon that should line up with
  // the marker's actual geographic coordinate — i.e. where the "tip" of the
  // pin touches down. Our path's point is at (50, 95) in a 0-100 viewBox.
  // Scaled to a 40x40 render: x = 50/100 * 40 = 20, y = 95/100 * 40 = 38.
  // Get this wrong and the pin will visually "float" away from the actual
  // coordinate instead of pointing right at it.
  iconAnchor: [20, 38],
});

//onMounted = Angulars ngOnInit = run this once, after the components HTML actually exists on the page. That timing matters here specifically because mapContainer.value(the real div) doesnt exist yet while the component is still being set up -- only once Vue has mounted it to the page can Leaflet attach to it. Thats why this logic has to live inside onMounted instead of just running at the top of <script setup>. why does the map-building code have to run inside onMounted instead of directly in the top level of <script setup>?  because mapContainer.value is null until the div actually renders. the components <script setup> block runs before the template gets rendered into real DOM. onMounted is the signal "the real DOM now exists, its safe to touch it"-the whole reason the lifecycle hook exists.
onMounted(() => {
  //L.map(mapContainer.value) builds a Leaflet map inside this div
  //.setView(locations[0].coords, 11) center it on the first location, zoom level 11
  map = L.map(mapContainer.value).setView(locations[0].coords, 11);

  //this is the actual visual map imagery(the roads/satellite-style background you see). its pulling the images from OpenStreeMaps free servers and layering them onto the map. attribution is the little credit text required by usage terms
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  //loop over both locations, and for each one: drop a pin(L.marker), attach a popup with its name(bindPopup), and wire up a click listener that just logs to the console (marker.on("click", ...)) this last part is Leaflets own event system, seperate from Vues @click
  //
  // index 0 (WSP office) gets our hand-authored SVG icon via the `icon`
  // option; index 1 (Boise) is left with no `icon` option, so Leaflet falls
  // back to its own default blue pin image — same marker.bindPopup/.on API
  // either way, since from Leaflet's point of view a custom icon is just a
  // different visual, not a different kind of marker.
  locations.forEach((loc, index) => {
    // Only include the `icon` key at all when we actually have a custom
    // one — an empty options object lets Leaflet's own default-icon merge
    // logic take over normally. (Explicitly passing `icon: undefined`
    // instead of omitting the key entirely was a real bug here: Leaflet's
    // options merge saw the key WAS present and didn't fall back to its
    // built-in default, crashing when it tried to render a nonexistent
    // icon.)
    const markerOptions = index === 0 ? { icon: customPinIcon } : {};
    const marker = L.marker(loc.coords, markerOptions).addTo(map);
    marker.bindPopup(loc.name);
    marker.on("click", () => console.log("marker clicked:", loc.name));
  });
});

// Always clean up the map instance on unmount — otherwise you leak
// listeners/DOM nodes, and a remount creates a second map in the same div.

//onUnmounted = the teardown counterpart to onMounted, fires when the component is about to be removed from the page(ex: you switch tabs away from 2.Leaflet map). map?.remove() destroys the Leaflet map instance. if you skip this and switch tabs back and forth would pile up duplicate map instances/leaked event listeners - a common bug
onUnmounted(() => {
  map?.remove();
});
</script>

<!-- just a heading, paragraph, and one meaningful element: the empty div ref=mapContainer, this is the DOM node Leaflet draws the actual map into. its "empty" in the markup because Leaflet fills it with canvas/image content via JavaScript, not via anything Vue renders declaratively -->

<!-- this file has no props, no emits - its self contained, which is why its the simplest example. the interesting new concept here isnt component communication, its ref as a DOM handle instead of ref as reactive state, plus the mount/unmount lifecycle timing -->

<template>
  <div>
    <h2>Leaflet map (Tier 1)</h2>
    <p>
      No API key needed. This is the concept-building exercise before Google
      Maps.
    </p>
    <div
      ref="mapContainer"
      style="height: 400px; width: 100%; border-radius: 8px"
    />
  </div>
</template>
