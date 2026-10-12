<!-- this is the child, small and dumb on purpose--it only knows how to show one label and one checkbox. it has zero idea what a map is, what Leaflet is, or what Facilities even means. Its a reusable little widget, like a single light switch. why parent/child? its purely about which file uses the other. LayeredMap.vue writes MapLegeng in its own template--its the one placing the widget on the page. Whoever embeds the other component is the parent.  -->

<script setup>
//defineProps and defineEmits are compiler macros, not real JS functions. they only exist a compile time. when Vues build tooling processes a .vue file, it looks for calls to defineProps(...) and defineEmits(...) inside <script setup>, reads what you passed them, and literally replaces/rewrites that code into the verbose props/emits options you saw earlier(the export default {props: {...}}). they are available globally. Together, these two declarations are the entire public API of the component - everything MapLegend.vue can receive and everything it can report back, with nothing else exposed. A parent using MapLegend only needs to read these two decalarations to know exactly how to use it, without reading a single line of the components internal logic. Both are plain Vue3 features you will see defineProps/defineEmits in essentially every Vue3 <script setup> component you ever open

//both part of Vue, the two functions you use inside <script setup> to declare a components contract with the outside world: what it accepts in, and what it can send back out

//defineProps - declares the Inputs this component accepts from whoever uses it(its parent). In MapLegend.vue, thats layerName and visible. Think of it as the component saying: if you want to use me, here the data you need to hand me
defineProps({
  layerName: { type: String, required: true },
  visible: { type: Boolean, default: true },
});

//declares the one custom event this component can fire
//declares the outputs this component can send back up. in MapLegend.vue, thats just toggle. the component is saying: heres the only thing I'll ever tell you about--when I get toggled
defineEmits(["toggle"]);
</script>

<template>
  <label style="display: block">
    <input
      type="checkbox"
      :checked="visible"
      @change="$emit('toggle', !visible)"
    />
    {{ layerName }}
  </label>
</template>
