<!-- this is the parent. its the big component in charge of the whole screen: it owns the map, it owns the list of layers(Facilities and Roads), and it decides what happens when something changes. the manager -->

<!-- Raster tiles are pixels you cant interact with individiually; vector/GeoJSON is data you can style, click, filter and toggle -->

<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapLegend from "./MapLegend.vue";

const mapContainer = ref(null);
let map;

//plain object - a lookup table this component will use internally to remember "which actual Leaflet layer object corresponds to the key 'facilities' vs 'roads'". never gets displayed, so it doesnt need to be reactive
const layerGroups = {};

// Two mock "layers" — this is the GeoJSON shape you'll see in real GIS data:
// a FeatureCollection of Features, each with a geometry + properties.

//the standard GeoJSON data shape
const facilitiesGeoJson = {
  //list of multiple geographic things
  type: "FeatureCollection",
  //the list itself
  //each feature has properties(arbitrary metadata-name, id, whatever you want) and geometry(the actual shape: type + coordinates )
  features: [
    {
      type: "Feature",
      properties: { name: "Facility A" },
      geometry: { type: "Point", coordinates: [-116.3915, 43.6121] },
    },
    {
      type: "Feature",
      properties: { name: "Facility B" },
      geometry: { type: "Point", coordinates: [-116.35, 43.63] },
    },
  ],
};

//single feature(not wrapped in a Feature Collection, since its just one line). GeoJSON coordinates are [longitude, latitude] - x before y.  a famous inconsistency in the GIS world(GeoJSON follows the x/y math convention; most mapping UIs display lat/lng because thats how humans say coordinates). one of the most common bugs in mapping code
const roadsGeoJson = {
  type: "Feature",
  properties: { name: "Sample route" },
  geometry: {
    type: "LineString",
    coordinates: [
      [-116.42, 43.6],
      [-116.35, 43.63],
      [-116.3, 43.65],
    ],
  },
};

//the reactive state. the single source of truth the UI is built from - the v-for in the template loops over this, and toggleLayer() mutates it. Notice it does not contain the actual GeoJSON data or Leaflet Objects, just the lightweight metatdata needed to drive checkboxes(key, display name, visible or not)
const layers = ref([
  { key: "facilities", name: "Facilities", visible: true },
  { key: "roads", name: "Roads", visible: true },
]);

//building the map and its layers
onMounted(() => {
  map = L.map(mapContainer.value).setView([43.6121, -116.3915], 11);
  //the URL string is the raster tiles - L.tileLayer() takes a URL template,and Leaflet substitutes real values into the placeholders to fetch actual .png image files. {z} is zoom level.  {x}, {y} is tile grid coordinates(think of the whole world map chopped into a grid of small square images at each zoom level; x/y pick which square). {s} is subdomain(OpenStreetMap serves tiles from multiple servers like a.tile..., b.tile... for load balancing; Leaflet rotates through them). So when you pan or zoom the map, Leaflet is constantly recalculating which {z}/{x}/{y} combination covers your current view, building the real URLs and fetching those .png files from OpenStreetMaps servers - thats literally the gray/beige roads and labels imagery your seeing underneath the markers. you never see the network activity in your own code; L.tileLayer handles all of it once you give it the URL template
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // L.geoJSON() is the direct bridge from "raw geographic data" to map layers.
  //this is the function that reads raw GeoJSON data and turns it into actual Leaflet map layers, and its saved into layerGroups so toggleLayer/watch can find it again later
  layerGroups.facilities = L.geoJSON(facilitiesGeoJson, {
    //pointToLayer(facilities only) - a customization hook: 'for every Point feature in this GeoJSON, instead of Leaflets default circle marker, draw it as a normal pin(L.marker) with a popup showing its name'. without this option L.geoJSON would still work, just with a different default marker style.
    pointToLayer: (feature, latlng) =>
      L.marker(latlng).bindPopup(feature.properties.name),
  }).addTo(map);

  //roads only - since this is a line, not a point, the customization is visual styling instead(line color/thickness) rather than marker shape
  layerGroups.roads = L.geoJSON(roadsGeoJson, {
    style: { color: "orange", weight: 3 },
  }).addTo(map);
});

//cleanup
onUnmounted(() => map?.remove());

//its what @toggle in the template calls .find() searches the layers array for the matching key, then flips .visible on that specific object
function toggleLayer(key, visible) {
  const layer = layers.value.find((l) => l.key === key);
  layer.visible = visible;
}

// watch here mirrors a common real pattern: UI state (checkbox) drives a
// side effect against an imperative, non-reactive library (Leaflet).

//passive subscriber reacting to data changes, decoupled from whatever caused them.
watch(
  layers,
  (updated) => {
    updated.forEach(({ key, visible }) => {
      const group = layerGroups[key];
      if (!group) return;
      if (visible && !map.hasLayer(group)) group.addTo(map);
      if (!visible && map.hasLayer(group)) map.removeLayer(group);
    });
  },
  { deep: true },
);
</script>

<template>
  <div>
    <h2>Layer toggling (props/emits + GeoJSON)</h2>
    <div style="display: flex; gap: 2rem; align-items: flex-start">
      <div>
        <!-- layers is the array defined on line 42-45(two objects: facilities, roads). this loop creates one MapLegend component per item in that array--so right now, two checkboxes get rendered, one for each layer object. the : syntax is shorthand for v-bind:layer-name="layer.name" nobody writes the long form in practice. without the colon, an attribute is just a literal string, same as plain HTML. with the colon, Vue evaulates whatevers inside the quotes as a JavaScript expression instead of a plain string. so the colon is literally the signal "treat this as data/an expression to evaulate, not treat as text"  -->
        <!-- the @toggle wires up a listener for the custom toggle event(the one MapLegend.vue) fires via $emit('toggle', !visible). the value assigned to it (val) is the parameter name you chose to receive whatever payload got emitted(the flipped boolean from MapLegend). when the event fires, Vue calls this arrow function and passes the emitted payload as val. the function body then calls your actual toggleLayer(key,visible) function(defined back on line 66), passing layer.key and val -->
        <MapLegend
          v-for="layer in layers"
          :key="layer.key"
          :layer-name="layer.name"
          :visible="layer.visible"
          @toggle="(val) => toggleLayer(layer.key, val)"
        />
      </div>
      <div
        ref="mapContainer"
        style="height: 400px; flex: 1; border-radius: 8px"
      />
    </div>
  </div>
</template>

<!-- Each of those squares is a separate .png image, typically 256×256 pixels, and the whole map is just these squares tiled edge-to-edge like a grid of photos. When you zoom in, Leaflet doesn't stretch/enlarge the existing images — it throws them away and fetches a completely different set of tiles for the new zoom level, each one pre-rendered by OpenStreetMap at that specific zoom's level of detail. That's why zooming in reveals new street names and smaller roads that weren't visible before — those are different source images, not a zoomed version of the same one. (You may briefly see a blurry upscaled version of the old tiles while the new ones load in — that's just a loading-state visual trick, not actually "zooming an image.")

One important thing those squares do not include: the pins/markers (L.marker(...)) you see on top are not part of the raster tiles at all. They're separate elements Leaflet draws on top of the map — an actual <img> icon positioned absolutely over the tile grid, tracking the map's pan/zoom. So when you pan the map, the tiles slide underneath, but the markers aren't "baked into" any tile image — they're independently positioned based on their lat/lng coordinates, same as the GeoJSON lines. That's actually a good mental model to have cold: tiles = the static picture underneath; markers/GeoJSON = things Leaflet draws independently on top, positioned by math, not by being part of an image.

Good question — that distinction (what's baked into the raster image vs. what's drawn separately) is exactly the kind of thing that signals real understanding vs. surface familiarity in an interview. -->

<!-- The one sentence that ties the whole file together, worth being able to say fluently: "The checkbox is a dumb UI component that just emits what the user wants. The parent updates a plain reactive array to reflect that desired state. A watch() then syncs that reactive state against Leaflet's imperative API, since Leaflet has no built-in concept of Vue reactivity." -->

<!-- Let's slow way down and trace one actual click, value by value — I think the abstract "watch runs when data changes" framing is the part that's not landing, so let's make it concrete.

Starting state, before any click:

layers.value = [
  { key: 'facilities', name: 'Facilities', visible: true },
  { key: 'roads', name: 'Roads', visible: true },
]

The "Roads" line is currently drawn on the map (orange line visible).

You click the "Roads" checkbox to uncheck it. Here's the exact sequence, one step at a time:

MapLegend.vue's @change="$emit('toggle', !visible)" fires. visible was true, so it emits 'toggle' with payload false.
LayeredMap.vue's @toggle="(val) => toggleLayer(layer.key, val)" catches it: layer.key is 'roads', val is false. So this calls toggleLayer('roads', false).
toggleLayer runs:
function toggleLayer(key, visible) {
  const layer = layers.value.find((l) => l.key === key) // finds the 'roads' object
  layer.visible = visible // sets it to false
}

Stop and notice: this function does nothing else. It does not call Leaflet. It does not touch the map. It only edits a plain JavaScript object sitting inside the layers array. If watch() didn't exist, the data would silently change and the map would look completely unchanged — the orange line would stay right there, now lying about what layers says.

Separately, automatically, with no explicit call from toggleLayer — Vue notices that layers (specifically, something nested inside it, because of { deep: true }) was mutated. This is what triggers the watch callback to run, on its own, because that's its entire job: sit and wait for layers to change, in any way, from any source.
The watch callback runs:
updated.forEach(({ key, visible }) => {
  const group = layerGroups[key]
  if (!group) return
  if (visible && !map.hasLayer(group)) group.addTo(map)
  if (!visible && map.hasLayer(group)) map.removeLayer(group)
})

It loops over the now-updated array. For the roads entry: key = 'roads', visible = false. group = layerGroups.roads (the actual Leaflet layer object saved back in onMounted). The second if matches: !visible is true, and map.hasLayer(group) is true (it's currently on the map) → so map.removeLayer(group) runs. This is the one and only line in the whole file that actually removes the orange line from the screen.

The key insight, stated directly: toggleLayer and the code that actually touches the map (watch) are two completely separate, disconnected pieces of code. toggleLayer never calls watch. watch never calls toggleLayer. They're connected only because they both touch the same reactive layers ref — one writes to it, the other is passively subscribed to it.

A fair question you might be asking: why not just put map.removeLayer(...) directly inside toggleLayer, instead of this indirect watch setup? You absolutely could, in a simple case like this — some real codebases would. The reason to use watch instead: it decouples "something changed the data" from "keep the map in sync with the data," so if layers ever got changed by some other code path later (a "reset all" button, data loaded from an API, anything) — you wouldn't have to remember to manually sync the map in every single one of those places too. You just change the data, and trust the one watch to keep the map honest, no matter what caused the change. -->
