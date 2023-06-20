<br/>
<p align="center">
<img alt="AnimAttr" src="https://raw.githubusercontent.com/0phoff/slidev-addon-animattr/master/components/logo-1.svg" width="700" />
</p>

<p align="center">
<a href="https://sli.dev">Slidev</a> addon to <b>animate</b> an element with a data-* <b>attributes</b>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/slidev-addon-animattr"><img alt="NPM Version" src="https://img.shields.io/npm/v/slidev-addon-animattr?color=4c72b0&label="></a>
<a href="https://0phoff.github.io/slidev-addon-animattr"><img alt="Demo" src="https://img.shields.io/badge/-demo-3d5b8d"></a>
<a href="#"><img alt="Downloads" src="https://img.shields.io/npm/dm/slidev-addon-animattr?color=2e446a&label="></a>
</p>

## Features

- **v-animattr** directive allows you to animate elements with CSS attribute selectors
- **SVG** files can be loaded as components with scoped CSS automatically
- **SMIL** animations allows for even more possibilities
 
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
The argument are passed to `v-animattr` as attributes.

```html
<div v-animattr :length="2">
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

The directive accepts different kind of arguments, in order to accommodate different scenarios.  
Check out [slide 4](https://0phoff.github.io/slidev-addon-animattr/4) of our demo for a live example of the different values.

> The most basic use case is to pass it a `length` argument, which will add N clicks to your element.
> At each click, a number from 0 to N-1 is added to data-animattr.
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
> <div v-animattr :length="3" />
> ```

> You can also specify a `start` argument.
> By default it is set to **1**, so that you effectively start with the base state and each value is added as a click,
> but you can set this value to any number greater than zero.
> Setting it to **0** effectively allows you to start an animation when the slide loads.
> 
> ```html
> <!--
> In the example below, `data-animattr` will be:
> 0. "0"
> 1. "0 1"
> 2. "0 1 2"
> -->
> 
> <div v-animattr :start="0" :length="3" />
> ```

> You can also modify the behaviour with the `stride` argument, only adding a step every N clicks.
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
> <div v-animattr :start="0" :length="3" :stride="2" />
> ```

> Instead of passing a `length`, you can also give it a `stop` argument to explicitly stop at a certain end click.
> 
> ```html
> <!--
> In the example below, `data-animattr` will be:
> 0. ""
> 1. ""
> 2. "0"
> 3. "0 1"
> 4. "0 1 2"
> -->
> 
> <div v-animattr :start="2" :stop="4" />
> ```

> Finally, you can also pass a `clicks` array, which tells the directive to only add a number to the attribute at those specific click values.
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
> <div v-animattr :clicks="[1, 3, 4]" />
> ```

Note that you can also pass in all the values as an object to the directive directly: `<div v-animattr={...} />`.
Additionally, there are a few shorthand syntax forms, which can be found in [slide 5](https://0phoff.github.io/slidev-addon-animattr/5) of the demo.

### SVG as components
The second part of this plugin is that it allows you to add **SVG** files to your `components/` folder.
You can then use these as regular components in your slides.
The main advantage of loading **SVG** files as components is that you can style them with CSS and thus also animate them with the `v-animattr` directive.

This addon uses a custom plugin build on top of [svgo](https://github.com/svg/svgo) to load the **SVG** as a Vue component.
It locates any `<style />` tags inside of your **SVG** and loads it as [Scoped CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css) for the component.
This allows you to embed the necessary CSS styling for your animations in the file and reuse the component more easily.

Check out [slide 8](https://0phoff.github.io/slidev-addon-animattr/8) of our demo for a live example of SVG CSS transitions.

### SMIL animations
You can start and stop [SMIL animations](https://css-tricks.com/guide-svg-animations-smil) by providing a `smil` argument.
These animations are more complex, but allow for things that CSS transformations do not (morph, move along path, etc).

Check out [slide 9](https://0phoff.github.io/slidev-addon-animattr/9) of our demo for a live example of SVG SMIL animations.

> Simply add a `smil` argument, which can either be an array of animation IDs to execute or an object where the keys are the indices at which to run.
> Multiple IDs can be separated by spaces.
> Note that the indices represent the `data-animattr` attribute values and not the slidev click value.
> 
> ```html
> <MySVGFile :length="3" :smil="['anim1 anim2', '', 'anim3']" />
> <MySVGFile :length="3" :smil="{0: 'anim1 anim2', 2: 'anim2'}" />
> ```

> You can prepend the IDs with a `+` or `-` to either start or stop the animation.  
> Use a `~` to tell the directive to stop the animation at the end of a cycle (before repeating).
> 
> ```html
> <MySVGFile :length="2" :smil="['+anim1', '-anim1']" />
> ```

> If you only want to execute the animation when moving forwards through your slides, prepend it with `>`.  
> `<` means it will run when moving backwards through the slides.  
> This can be combined with `+`, `-` and `~`.
> 
> ```html
> <MySVGFile :length="2" :smil="['>anim1_fw <anim1_bw', '>~anim1_fw']" />
> ```


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
