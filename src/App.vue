<script setup>
import { ref } from 'vue'
import Counter from './components/Counter.vue'
import BasicMap from './components/BasicMap.vue'
import LayeredMap from './components/LayeredMap.vue'
import GoogleMap from './components/GoogleMap.vue'
import SvgDemo from './components/SvgDemo.vue'
import SearchBox from './components/SearchBox.vue'
import QuasarDemo from './components/QuasarDemo.vue'

const tabs = [
  { key: 'counter', label: '1. Reactivity' },
  { key: 'leaflet', label: '2. Leaflet Map' },
  { key: 'layers', label: '3. Layers + GeoJSON' },
  { key: 'google', label: '4. Google Maps' },
  { key: 'svg', label: '5. SVG' },
  { key: 'search', label: '6. Debounced Search' },
  { key: 'quasar', label: '7. Quasar' },
]
const activeTab = ref('counter')

function onSearch(value) {
  console.log('search fired with:', value)
}
</script>

<template>
  <h1>WSP Interview Prep — Vue + Mapping Practice</h1>
  <p>
    Companion project for <code>notes/training_curriculum.md</code>. Each tab is one exercise —
    open the matching file in <code>src/components/</code> while you work through it.
  </p>

  <nav>
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: activeTab === tab.key }"
      @click="activeTab = tab.key"
    >
      {{ tab.label }}
    </button>
  </nav>

  <Counter v-if="activeTab === 'counter'" />
  <BasicMap v-else-if="activeTab === 'leaflet'" />
  <LayeredMap v-else-if="activeTab === 'layers'" />
  <GoogleMap v-else-if="activeTab === 'google'" />
  <SvgDemo v-else-if="activeTab === 'svg'" />
  <div v-else-if="activeTab === 'search'">
    <h2>Debounced search (try rebuilding SearchBox.vue from memory)</h2>
    <SearchBox @search="onSearch" />
    <p>Check the browser console for emitted search events.</p>
  </div>
  <QuasarDemo v-else-if="activeTab === 'quasar'" />
</template>
