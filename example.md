---
title: AnimAttr
---

<div class="w-full h-full flex flex-col justify-center items-center">

<img src="/logo-1.svg" class="mb-8" />

# A SliDev Addon

<div class="w-full flex flex-row justify-center gap-8 mt-12 text-6xl">
    <a href="https://github.com/0phoff/slidev-addon-animattr" target="_blank"><mdi-github /></a>
    <a href="https://www.npmjs.com/package/slidev-addon-animattr" target="_blank"><carbon-logo-npm /></a>
</div>
</div>

<style>
    h1 {
        @apply !text-4xl uppercase font-light;
    }

    a {
        border: none !important;
        transition: 100ms ease transform;
    }

    a:focus-visible, a:hover, a:active {
        transform: scale(1.2);
    }
</style>

---

# Basic Example

<div class="grid grid-cols-2 place-items-center w-full">

```html
<div
 class="test"
 v-animattr :length="2"
/>

<style>
    .test {
        width: 250px;
        height: 250px;
        border-radius: 100%;
        background-color: darkgreen;
        transition: background 500ms ease;
    }

    .test[data-animattr~="0"] {
        background-color: darkorange;
    }
    .test[data-animattr~="1"] {
        background-color: darkred;
    }
</style>
```

<div class="test" v-animattr="2" />
</div>

<style>
    .place-items-center {
        place-items: center
    }
    
    .test {
        width: 250px;
        height: 250px;
        border-radius: 100%;
        background-color: darkgreen;
        transition: background 500ms ease;
    }

    .test[data-animattr~="0"] {
        background-color: darkorange;
    }
    .test[data-animattr~="1"] {
        background-color: darkred;
    }
</style>

---
layout: section
---

# API

------

# Directive Arguments
[Click here](https://github.com/0phoff/slidev-addon-animattr#v-animattr-directive) for more information.  
Clicks: {{ $slidev.nav.clicks }}

<div v-animattr="5">&lt;div v-animattr :length="5" /&gt;</div>

<div v-animattr="5" :start="0">&lt;div v-animattr :start="0" :length="5" /&gt;</div>

<div v-animattr="[0, 2, 4, 6]">&lt;div v-animattr :clicks="[0, 2, 4, 6]" /&gt;</div>

<div v-animattr="{start: 1, stop: 9, stride: 4}">&lt;div v-animattr :start="1" :stop="9" :stride="4" /&gt;</div>

<style>
    div[data-animattr] {
        margin: 2.5rem 0;
    }

    div[data-animattr]::after {
        content: "‣ " attr(data-animattr);
        display: block;
        padding-top: 5px;
        opacity: 0.4;
    }
</style>

---

# Alternative Syntax

The `v-animattr` directive can either be configured with various attributes (start, stop, length, stride, clicks),
or by passing an object to the directive as an argument.  
The following examples are thus similar:

```html
<div v-animattr :start="3" :length="5" :stride="2" />
<div v-animattr="{start: 3, length: 5, stride: 2}" />
```

<v-click>

It also accepts a few shorthand syntax forms, for commonly used tasks:

```html
<div v-animattr :length="3" />
<div v-animattr="3" />
```

```html
<div v-animattr :clicks="[0,2,3,9]" />
<div v-animattr="[0,2,3,9]" />
```

</v-click>

<style>
    .slidev-layout h1 + p {
        opacity: 1;
    }

    p {
        margin-top: 2.5rem !important;

    }
</style>

---

# SMIL
This addon also allows you to start and stop [SMIL animations](https://css-tricks.com/guide-svg-animations-smil) of your SVG files.  

Simply add a `smil` argument, which can either be an array of animation IDs to execute or an object where the keys are the indices at which to run.
Multiple IDs can be separated by spaces.  
Note that the indices represent the `data-animattr` attribute values and not the slidev click value.

```html
<MySVGFile :length="3" :smil="['anim1 anim2', '', 'anim3']" />
<MySVGFile :length="3" :smil="{0: 'anim1 anim2', 2: 'anim2'}" />
```

<v-click>

You can prepend the IDs with a `+` or `-` to either start or stop the animation.  
Use a `~` to tell the directive to stop the animation at the end of a cycle (before repeating).

```html
<MySVGFile :length="2" :smil="['+anim1', '-anim1']" />
```

</v-click>
<v-click>

If you only want to execute the animation when moving forwards through your slides, prepend it with `>`.  
`<` means it will run when moving backwards through the slides.  
This can be combined with `+`, `-` and `~`.

```html
<MySVGFile :length="2" :smil="['>anim1_fw <anim1_bw', '>~anim1_fw']" />
```

</v-click>

<style>
    .slidev-layout h1 + p {
        opacity: 1;
    }
</style>


---
layout: section
---

# Examples

---

# SVG Example

<div class="grid grid-cols-2 place-items-center w-full">

<div class="flex flex-col justify-around text-center items-center">

<!-- SVG is used inline here so we do not need a separate file, but it can be placed in components. -->
<svg width="250px" viewBox="0 0 100 100" v-animattr="1" :start="0">
    <rect width="50" height="50" x="25" y="25" fill="transparent" stroke="#4C72B0" stroke-width="5px" stroke-linecap="square" pathLength="1" />
</svg>

The styles can also be placed inside the SVG file,  
allowing for more reusable components.  
They will then be loaded as scoped CSS  
and not pollute other SVGs.

Additionally, you can add the attributes for the  
`v-animattr` directive as `data-*` attributes in the SVG file as well (eg. `data-length="1"`).
</div>

<div style="margin-top: -25px">

```svg
<!-- components/CustomRect.svg -->
<svg viewBox="0 0 100 100">
    <rect
        width="50" height="50" x="25" y="25"
        fill="transparent" stroke="#4C72B0"
        stroke-width="5px" stroke-linecap="square"
        pathLength="1"
    />
</svg>
```

```html
<!-- slides.md -->
<CustomRect v-animattr :start="0" :length="1"/>

<style>
    svg[data-animattr] rect {
        stroke-dasharray: 1;
        stroke-dashoffset: 0;
        transition: stroke-dashoffset 250ms ease-in;
    }

    svg[data-animattr~="0"] rect {
        stroke-dashoffset: 1;
    }
</style>
```

</div>
</div>

<style>
    .place-items-center {
        place-items: center
    }

    p {
        opacity: 0.6;
        margin-top: 0 !important;
    }
    

    svg[data-animattr] rect {
        stroke-dasharray: 1;
        stroke-dashoffset: 1;
        transition: stroke-dashoffset 250ms ease-in 200ms;
    }

    svg[data-animattr~="0"] rect {
        stroke-dashoffset: 0;
    }
</style>

---

# SMIL Example

<div class="flex flex-col w-full moveup">

<!-- SVG is used inline here so we do not need a separate file, but it can be placed in components. -->
<svg width="250px" viewBox="0 0 100 80" v-animattr="3" :start="0" :smil="{0: '<~morph', 1: '+morph', 2: '-morph'}">
    <polygon fill="#4C72B0" points="25,25 25,75 75,75 75,25">
        <animate
            id="morph"
            begin="indefinite" dur="3s" fill="freeze" repeatCount="indefinite"
            attributeName="points"
            values="25,25 25,75 75,75 75,25 ; 50,25 25,75 75,75 50,25 ; 25,25 25,75 75,75 75,25 ; 25,25 50,75 50,75, 75,25 ; 25,25 25,75 75,75 75,25"
            keyTimes="0 ; 0.25 ; 0.5 ; 0.75 ; 1"
            calcMode="spline"
            keySplines="0.5 0 0.5 1 ; 0.5 0 0.5 1 ; 0.5 0 0.5 1 ; 0.5 0 0.5 1"
        />
    </polygon>
</svg>

```html
<!-- slides.md -->
<MorphPolygon v-animattr :length="3" :start="0" :smil="{0: '<~morph', 1: '+morph', 2: '-morph'}" />
```

<div class="svgcode col-span-2">

```svg
<!-- components/MorphPolygon.svg -->
<svg width="250px" viewBox="0 0 100 100">
    <polygon fill="#4C72B0" points="25,25 25,75 75,75 75,25">
        <animate
            id="morph"
            begin="indefinite" dur="3s" fill="freeze" repeatCount="indefinite"
            attributeName="points"
            values="25,25 25,75 75,75 75,25 ; 50,25 25,75 75,75 50,25 ; 25,25 25,75 75,75 75,25 ; 25,25 50,75 50,75, 75,25 ; 25,25 25,75 75,75 75,25"
            keyTimes="0 ; 0.25 ; 0.5 ; 0.75 ; 1"
        />
    </polygon>
</svg>
```

</div>
</div>

<style>
    .moveup {
        margin-top: -60px;
    }

    svg {
        place-self: center
    }

    pre {
        @apply text-xs;
        font-size: 0.59rem !important;
    }
</style>


---
title: AnimAttr
---

<div class="w-full h-full flex flex-col justify-center items-center">

<logo-2 />

<div class="w-full flex flex-row justify-center gap-8 mt-12 text-6xl">
    <a href="https://github.com/0phoff/slidev-addon-animattr" target="_blank"><mdi-github /></a>
    <a href="https://www.npmjs.com/package/slidev-addon-animattr" target="_blank"><carbon-logo-npm /></a>
</div>
</div>

<style>
    h1 {
        @apply !text-4xl uppercase font-light;
    }

    a {
        border: none !important;
        transition: 100ms ease transform;
    }

    a:focus-visible, a:hover, a:active {
        transform: scale(1.2);
    }
</style>
