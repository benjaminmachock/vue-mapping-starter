import { onMounted, onUnmounted, ref } from "vue";

// A composable = Vue's version of a React custom hook: reusable reactive
// logic, extracted out of any one component.

//navigator.geolocation is a built in browser object(GeoLocation Web API)
export function useGeolocation() {
  //no data yet, async code will fill in later. at the moment the component first renders, you have no location yet(getting it from the browsers GPS/network takes time--its asynchronous). null is JS conventional way of saying "intentionally nothing here".  later inside watchPositions success callback --once the browser actually reports a location, the ref gets reassigned to a real object. because its reactive, anything displaying coords in a template updates automatically at that moment. the reason null matters specifically(not just some placeholder): null is falsy in JS, and a real coordinates object is truthy.  that lets a template distinguish "not loaded yet" from "loaded" with a plain v-if.  so initialize reactive state to a placeholder representing absence, then let async code replace it--common pattern that will be used constantly

  //   ref(null) creates an object — conceptually { value: null } — and Vue wires up that .value property with special getter/setter behavior so it can track every read and write to it (that’s the reactivity mechanism: Vue notices “something read coords.value” and “something wrote to coords.value” and uses that to know what needs to re-render).

  // Here’s the deeper reason ref() has to work this way, which is worth knowing cold: JavaScript primitives (null, numbers, strings, booleans) can’t be made reactive on their own. There’s no way to intercept “someone read this plain variable” or “someone reassigned this plain variable” for a raw value like null or 5 — JavaScript just doesn’t give you a hook into that. Objects, on the other hand, can have their property access intercepted (that’s what Vue’s Proxy-based reactivity relies on). So ref()’s whole trick is: wrap whatever you give it — even a primitive like null — inside an object, so there’s now a property (.value) whose reads/writes Vue can intercept.

  // That’s also exactly why .value is required everywhere in your script code (coords.value = {...}), but not in the template ({{ coords }} — no .value needed there) — Vue’s template compiler automatically unwraps top-level refs for you as a convenience, but in plain JS, you’re just interacting with a normal object property, so you always need .value to get at the real wrapped value.

  // This applies no matter what you pass in — ref(null), ref(0), ref(''), ref({ foo: 'bar' }) — they all get wrapped in this same .value-holding object. It’s the one mechanism that makes anything trackable by Vue, regardless of whether what you’re wrapping is a primitive or already an object.
  const coords = ref(null);
  const error = ref(null);
  let watchId;

  onMounted(() => {
    if (!navigator.geolocation) {
      error.value = "Geolocation not supported";
      return;
    }
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        coords.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      (err) => {
        error.value = err.message;
      },
    );
  });

  onUnmounted(() => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
  });

  return { coords, error };
}
