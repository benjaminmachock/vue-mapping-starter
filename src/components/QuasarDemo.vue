<script setup>
import { ref } from "vue";

const layers = ref(["Facilities", "Roads", "Parcels"]);
let nextId = 1;

function addLayer() {
  layers.value.push(`New Layer ${nextId++}`);
}

function removeLayer(index) {
  layers.value.splice(index, 1);
}
</script>

<template>
  <div>
    <h2>Quasar — Vue UI library (preferred qualification)</h2>
    <p>
      Same mental model as any component library — <code>q-</code>-prefixed
      components, prop-driven, just like Astro UXDS.
    </p>

    <q-list bordered separator style="max-width: 400px">
      <q-item v-for="(layer, index) in layers" :key="layer">
        <q-item-section>{{ layer }}</q-item-section>
        <q-item-section side>
          <q-btn
            aria-label="Remove layer"
            flat
            round
            dense
            icon="close"
            @click="removeLayer(index)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn
      color="primary"
      label="Add Layer"
      icon="add"
      @click="addLayer"
      style="margin-top: 1rem"
    />
  </div>
</template>
