<br/>
<p align="center">
<img alt="AnimAttr" src="https://raw.githubusercontent.com/0phoff/slidev-addon-animattr/master/components/logo-1.svg" width="700" />
</p>

<p align="center">
<a href="https://sli.dev">Slidev</a> addon to <b>animate</b> an element with a data-* <b>attributes</b>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/slidev-addon-animattr"><img alt="NPM Version" src="https://img.shields.io/npm/v/slidev-addon-animattr?color=4C72B0&label="</a>
<a href="https://0phoff.github.io/slidev-addon-animattr"><img alt="Demo" src="https://img.shields.io/badge/-demo-0E103D"></a>
</p>

## Features

- **v-animattr** directive allows you to animate elements with CSS attribute selectors
- **SVG** files can be loaded as components with scoped CSS automatically
 
## Installation

First, install the addon.

```bash
npm install slidev-addon-animattr
```

Then, add the following frontmatter to your `slides.md`.  

<pre><code>---
addons:
  - <b>slidev-addon-animattr</b>
---</code></pre>

[More Information](https://sli.dev/addons/use.html)

## Usage
Make sure to check out this [demo presentation](https://0phoff.github.io/slidev-addon-animattr),
which shows some of the main capabilities of AnimAttr.

### v-animattr directive
The `v-animattr` directive gives your HTML elements an additional `data-animattr` attribute.
This attribute starts empty, but gets filled with increasing numbers whilst stepping through the clicks of your slide.
This allows you to animate your elements with [CSS attribute selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors). 
The value you pass to `v-animattr` will define the number of clicks it gets.

```html
<div v-animattr="2">
This div will change background color 2 times
</div>

<style>
    /* Base Styling */
    div {
        background-color: green;
    }

    /* First change */
    div[data-animattr~="0"] {
        background-color: orange;
    }

    /* Second change */
    div[data-animattr~="1"] {
        background-color: red;
    }
</style>
```

<br/>

The directive accepts different kind of input values, in order to accommodate different scenarios.  
Check out [slide 4](https://0phoff.github.io/slidev-addon-animattr/4) of our demo for a live example of the different values.

> Passing a number N will simply add N clicks.
> At each click, a number from 0 to N-1 is added to `data-animattr`. 
> 
> ```html
> <!--
> In the example below, `data-animattr` will be:
> 0. ""
> 1. "0"
> 2. "0 1"
> 3. "0 1 2"
> -->
> 
> <div v-animattr="3" />
> ```

> Adding the `on-load` modifier makes it so the first step happens when the slide loads.
> It still results in the same values in `data-animattr`, but it has adds one less click to your slides.
> The main use case for this modifier is to animate an object when the slide loads.
> Note that this modifier only has an effect when the passed value is a number and that you do not need to add `preload: false` for this to work.
> 
> ```html
> <!--
> In the example below, `data-animattr` will be:
> 0. "0"
> 1. "0 1"
> 2. "0 1 2"
> -->
> 
> <div v-animattr.on-load="3" />
> ```

> You can also pass an array, which tells the directive to only add a number to the attribute at those specific click values.
> Note that the value `0` means when the slide first appears.
> 
> ```html
> <!--
> In the example below, `data-animattr` will be:
> 0. ""
> 1. "0"
> 2. "0"
> 3. "0 1"
> 4. "0 1 2"
> -->
> 
> <div v-animattr="[1, 3, 4]" />
> ```

> Finally, you can also pass an object with a `start`, `stop` and optionally a `step` attribute.
> This tells the directive to add numbers to the attribute from `start` to `stop` (inclusive), and optionally using a stride of `step`.
> 
> ```html
> <!--
> In the example below, `data-animattr` will be:
> 0. "0"
> 1. "0"
> 2. "0 1"
> 3. "0 1"
> 4. "0 1 2"
> -->
> 
> <div v-animattr="{start: 0, stop: 4, step: 2}" />
> ```

### SVG as components
The second part of this plugin is that it allows you to add **SVG** files to your `components/` folder.
You can then use these as regular components in your slides.
The main advantage of loading **SVG** files as components is that you can style them with CSS and thus also animate them with the `v-animattr` directive.

This addon uses a custom plugin build on top of [svgo](https://github.com/svg/svgo) to load the **SVG** as a Vue component.
It locates any `<style />` tags inside of your **SVG** and loads it as [Scoped CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css) for the component.
This allows you to embed the necessary CSS styling for your animations in the file and reuse the component more easily.

Check out [slide 3](https://0phoff.github.io/slidev-addon-animattr/3) of our demo for a live example of SVG animations.

## Contributing

- `pnpm install`
- `pnpm run dev` to start a preview of `example.md`

## License

<p align="center">
MIT License © 2023 <a href="https://github.com/0phoff">0phoff</a>
</p>

<p align="center">
<img alt="AnimAttr" src="https://raw.githubusercontent.com/0phoff/slidev-addon-animattr/master/components/logo-2.svg" width="350" />
</p>
