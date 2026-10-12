<script setup>
import { ref } from "vue";
const active = ref(false);

function toggle() {
  active.value = !active.value;
}

// Native <button> activates on Enter AND Space automatically. A custom
// element with role="button" does not get that for free — this is the
// manual equivalent, checking for both keys since users expect both to
// work on anything announced as a "button".
function onKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault(); // stop Space from also scrolling the page
    toggle();
  }
}
</script>

<!-- the viewBox defines 4 numbers; min-x min-y width height--it says the internal coordinate space of this drawing spans from (0,0) to (100,100) the seperate width/height attributes on the svg tab control the rendered pixel size on the page. SVG then scales the internal coordinate space to fit whatever rendered size you give it.  This is the key mental model shift from raster images: SVG coordinates are not pixels. They are abstract units that get stretched to fit. A view box of 0 0 100 100 rendered at width=150 height=150 means every 1 unit in your SVG math equals 1.5 actual screen pixels - but you never have to think about that conversion yourself. You just draw in the viewBox coordinate space, and SVG handles scaling it to any acutal display size. This is why SVG is resolution-independent(vector) in a way a PNG tile never can be - the same markup renders crisp at any size, because nothing is pixel locked. one more critical detail: SVG's Y-axis points downward, not upward like standard math graphs -- (0,0) is the top left corner and Y increases as you go down.  -->

<template>
  <div>
    <h2>SVG interactivity (click the circle, or Tab to it and press Enter/Space)</h2>
    <!--
      Accessibility fix: a plain <svg> with only @click is a real
      keyboard-accessibility gap — confirmed firsthand earlier by tabbing
      through the page and watching focus skip right over it. A native
      <button> gets all four of the following for free; a custom element
      like this needs every one of them added by hand:

        role="button"     -> tells assistive tech "treat this like a
                              button," not just a picture to skip over
        tabindex="0"       -> makes it reachable by pressing Tab at all
                              (without this, it's invisible to keyboard
                              navigation no matter what else is added)
        :aria-label        -> an accessible name — there's no text content
                              inside an <svg> for a screen reader to read,
                              so without this it would be announced as an
                              unlabeled button, which is barely better than
                              nothing
        @keydown           -> native buttons activate on BOTH Enter and
                              Space automatically. A custom element does
                              NOT get that behavior for free just from
                              having role="button" — it still has to be
                              wired up manually, which is what toggle()
                              + the key check below does.
    -->
    <svg
      viewBox="0 0 100 100"
      width="150"
      height="150"
      role="button"
      tabindex="0"
      :aria-label="active ? 'Shrink circle' : 'Grow circle'"
      @click="toggle"
      @keydown="onKeydown"
    >
      <circle
        cx="50"
        cy="50"
        :r="active ? 40 : 20"
        fill="steelblue"
        style="transition: r 0.3s ease; cursor: pointer"
      />
    </svg>

    <h2>Custom path-based icon (hand-authored, not from a library)</h2>
    <!--
      This is a simplified, angular map-pin silhouette built entirely from
      straight-line path commands — no curves (no "C" command) needed.

      viewBox is 0 0 100 100 again, same coordinate space as the circle
      above, so the same mental model applies: draw in 0-100 units, SVG
      scales it to whatever width/height you render at.

      Reading the `d` attribute like pen movements, one command at a time:

        M 20,10   -> "Move to" (20,10): pick up the pen, place it at the
                     top-left corner of the pin's body. No line drawn yet —
                     this just sets the starting point.
        L 80,10   -> "Line to" (80,10): draw a straight line across to the
                     top-right corner. This is the top edge of the body.
        L 80,60   -> Line down to (80,60): the right edge of the body.
        L 50,95   -> Line down-and-in to (50,95): this is the pin's POINT —
                     the bottom tip, pulled in to the horizontal center (x=50)
                     and pushed down near the bottom of the viewBox (y=95).
                     This single point is what makes the shape look like a
                     pin/marker instead of just a rectangle.
        L 20,60   -> Line up-and-left to (20,60): the left edge of the body,
                     mirroring the 80,60 point on the right side.
        Z         -> "Close path": draw a final straight line back to
                     wherever the path started (20,10), sealing the shape
                     into one closed, fillable outline.

      Five points total (one of them implicit via Z) make a simple pentagon:
      a flat-topped rectangle body with a triangular point at the bottom —
      a plain, angular stand-in for the classic rounded "teardrop" pin shape
      you see on Google Maps/Leaflet default markers (those use curved "C"
      path commands instead of straight "L" lines, which is why they look
      rounded — same underlying idea, just more complex math).
    -->
    <svg viewBox="0 0 100 100" width="100" height="100">
      <path d="M 20,10 L 80,10 L 80,60 L 50,95 L 20,60 Z" fill="crimson" />
    </svg>

    <h2>Pulsing marker (CSS @keyframes — multi-step, looping animation)</h2>
    <!--
      A CSS transition (the circle up top) only handles a single A-to-B
      change triggered by something toggling. This effect is different: it
      loops forever on its own, with no click needed — that requires
      @keyframes instead.

      Two circles, same center, same radius — layered on top of each other:

        1. The FIRST <circle> is the one that gets animated — it's the
           expanding, fading "ring". In SVG, elements paint in document
           order, so whatever's written first is BEHIND whatever's written
           after it. This one goes first so it ends up behind the solid dot.
        2. The SECOND <circle> is the plain, static, solid dot on top —
           always there, never animated, just marking the actual point.

      The @keyframes block itself: each percentage is a snapshot of what
      the animated element should look like at that point in the animation's
      timeline. "0%" = how it starts, "100%" = how it ends (then it loops,
      because of `infinite` in the animation shorthand below). Between the
      two keyframes, the browser automatically interpolates every frame —
      you only describe the start/end states, not every step.

      One real SVG-specific gotcha worth knowing: `transform-origin` for an
      SVG shape doesn't reliably default to the shape's own center the way
      it does for a normal HTML element — browser behavior has historically
      been inconsistent here. Setting it explicitly to the circle's actual
      center coordinate (50,50 — matching cx/cy) avoids relying on that
      default at all, so the ring expands evenly from its own center instead
      of scaling from some unexpected corner.
    -->
    <svg viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="15" fill="crimson" class="pulse-ring" />
      <circle cx="50" cy="50" r="15" fill="crimson" />
    </svg>
  </div>
</template>

<style scoped>
/* the keyframe does nothing - defining it doesnt animate anything yet. you have to separately apply it to an element with the animation property, which is exactly what the animation line does */

/* 1.5 how long one cycle takes, the easing curve(ease-out) and how many times to repeat infinite--forever or could be a number instead */

/* The key structural difference from transition (which you already know from the growing-circle example): a transition only interpolates between exactly two states — current value and new value — and only fires in response to something actually changing (a class toggling, a prop changing). @keyframes can define as many intermediate steps as you want, and critically, it can run entirely on its own — no trigger needed, no state change required, and it can loop forever via infinite. That’s why the pulsing ring animates immediately on page load with no click required, while the circle only grows when you actually click it. */

.pulse-ring {
  transform-origin: 50px 50px;
  animation: pulse 1.5s ease-out infinite;
}

/* keyframes is a CSS feature that lets you define a named animation sequence - a set of snapshots describing what an element should look like at different points along a timeline, with the browser automatically smoothing between them */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
