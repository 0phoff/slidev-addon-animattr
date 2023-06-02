---
title: AnimAttr
---

<div class="w-full h-full flex flex-col justify-center items-center">

<logo-1 class="mb-8" />

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
<div class="test" v-animattr="2" />

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

# SVG Example

<div class="grid grid-cols-2 place-items-center w-full">

<div class="flex flex-col justify-around text-center items-center">

<!-- SVG is used inline here so we do not need a separate file, but it can be placed in components. -->
<svg width="300px" viewBox="0 0 100 100" v-animattr.on-load="1">
    <rect width="50" height="50" x="25" y="25" fill="transparent" stroke="#4C72B0" stroke-width="5px" stroke-linecap="square" pathLength="1" />
</svg>

The styles can also be placed inside the SVG file,  
allowing for more reusable components.  
They will then be loaded as scoped CSS  
and not pollute other SVGs.

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
<CustomRect v-animattr.on-load="1" />

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

# Different Directive Values

Clicks: {{ $slidev.nav.clicks }}

<div v-animattr="5">v-animattr="5"</div>

<div v-animattr.on-load="5">v-animattr.on-load="5"</div>

<div v-animattr="[0, 2, 4, 6]">v-animattr="[0, 2, 4, 6]"</div>

<div v-animattr="{start: 1, stop: 9, stride: 4}">v-animattr="{start: 1, stop: 9, stride: 4}"</div>

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
