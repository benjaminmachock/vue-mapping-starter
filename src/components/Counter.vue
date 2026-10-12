<!-- Vues compile-time shorthand for writing a component with the Composition API inside a single file component. without it you have write a verbose form. treats the whole block as setup function. every top level const/function(like count, doubled, increment) is auto exposed to the template-- no manual return object -->
<script setup>
import { ref, computed } from "vue";

const count = ref(0);

//computed creates a derived, read-only reactive value from other reactive state. 2 things make it different from just calling a regular function. its cached(memoized). the function inside only re-runs when one of its reactive dependencies(count here) actually changes. its reactive itself. doubled is a ref-like object - the template auto-unwraps it({{doubled}}) and if you used it inside another computed() or watch(), Vue tracks that dependency too. when count changes. Vue knows how to recompute doubled and re-render anywhere its displayed.  computed is for deriving a value from existing state, whereas watch/watchEffect is for reacting to a change by doing something else, like an API call or a DOM mutation
const doubled = computed(() => count.value * 2);

function increment() {
  count.value++;
}

function reset() {
  count.value = 0;
}
</script>

<template>
  <div>
    <h2>Reactivity warm-up</h2>
    <button @click="increment">
      Count: {{ count }} (doubled: {{ doubled }})
    </button>
    <button @click="reset">Reset</button>
  </div>
</template>
