/*
 *  Main Directive Code
 */
import { watch, onUnmounted } from 'vue';
import { injectionClicks, injectionClicksElements, injectionClicksDisabled, injectionSlidevContext } from "@slidev/client/constants.ts";
import { pluginsOnCreated, pluginsOnClicked } from './plugin';
import { getName, parseObject, resolveArgument } from './util';

import type { App, DirectiveBinding, VNode, Ref, UnwrapNestedRefs} from 'vue';
import type { SlidevContext } from '@slidev/client/modules/context';

/*
 * PLUGINS
 */
import './smil';


/*
 * TYPES
 */
interface AnimattrOptions {
    start?: number,
    stop?: number,
    length?: number,
    stride?: number,
    clicks?: number[],
}


/*
 *  CONSTANTS
 */
const attributeName = 'data-animattr';
const idPrefix = 'animattr-';
const argumentKeys = ['start', 'stop', 'length', 'stride', 'clicks'];
const argumentSymbol = Symbol('animattr-args');


/*
 *  FUNCTIONS 
 */
function makeId(length: number = 5): string {
    // Code taken from slidev
    // https://github.com/slidevjs/slidev/blob/8a7d4e239e307e2a95982d3bfa72377b779843cb/packages/client/builtin/CodeBlockWrapper.vue#L48
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    const result = [idPrefix];
    for (let i = 0; i < length; i++)
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));

    return result.join('');
}

function getOptions(binding: DirectiveBinding, node: VNode): AnimattrOptions {
    // Parse options
    const options: AnimattrOptions = {};
    for (const key of argumentKeys) {
        const value = resolveArgument(key, binding, node);

        if (value == undefined) {
            options[key] = value;
        }
        else if (key === 'clicks') {
            options[key] = typeof value === 'string' ? parseObject(value) : value;
        }
        else {
            options[key] = Number(value);
        }
    }

    // Shortcut options
    if (Array.isArray(binding.value)) {
        options.clicks = binding.value;
    }
    else if (binding.value) {
        const length = Number(binding.value);
        if (!isNaN(length)) {
            options.length = length;
        }
    }

    // Remove undefined or null
    Object.keys(options).forEach(key => options[key] == undefined && delete options[key]);

    // Check options validity
    if ('clicks' in options && Object.keys(options).some(v => v in ['start', 'stop', 'stride', 'length'])) {
        console.warn(`[AnimAttr] <${getName(node)} /> has both "clicks" and "start,stop,length,stride". "clicks" takes precedence.`);
    }
    else if ('length' in options && 'stop' in options) {
        console.warn(`[AnimAttr] <${getName(node)} /> has both "stop" and "length". "stop" takes precedence.`);
    }
    else if (!('clicks' in options || 'stop' in options || 'length' in options)) {
        console.warn(`[AnimAttr] <${getName(node)} /> has no "clicks", "stop" or "length". No clicks will be added`);
    }

    return options;
}

function getAnimateArray(options: AnimattrOptions): string[] {
    if (options.clicks) {
        const value = [...options.clicks].sort();
        const max = value[value.length - 1];
        const animateArray: string[] = Array(max).fill('');

        for (let i = 0; i < value.length; i++) {
            animateArray[value[i]] = i.toString();
        }

        return animateArray;
    }

    if (options.stop) {
        const start = options.start ?? 1;
        const stride = options.stride ?? 1;
        const animateArray: string[] = Array(options.stop).fill('');

        for (let j = 0, i = start; i <= options.stop; i += stride) {
            animateArray[i] = j.toString();
            j++;
        }

        return animateArray;
    }

    if (options.length) {
        const start = options.start ?? 1;
        const stride = options.stride ?? 1;
        const animateArray: string[] = Array(start + (options.length - 1) * stride).fill('');

        for (let i = 0; i < options.length; i++) {
            animateArray[start + i * stride] = i.toString();
        }

        return animateArray;
    }

    return [];
}

export default function createAnimattrDirective() {
    return {
        install(app: App) {
            app.directive('animattr', {
                created(el: HTMLElement, binding, node) {
                    el[argumentSymbol] = getOptions(binding, node);
                    pluginsOnCreated(el, binding, node);

                    const clicksDisabled: Ref<boolean> = (binding.instance?.$ as any).provides[injectionClicksDisabled as any];
                    if (binding.value && clicksDisabled.value) {
                        // Clicks disabled -> setup end state
                        const attributeValue = getAnimateArray(el[argumentSymbol]).join(' ').trim();
                        el.setAttribute(attributeName, attributeValue);
                    } else {
                        // Clicks enabled -> setup attribute to empty string
                        el.setAttribute(attributeName, '');
                    }
                },

                mounted(el: HTMLElement, binding, node) {
                    const clicks: Ref<number> = (binding.instance?.$ as any).provides[injectionClicks as any];
                    const clicksElements: Ref<any[]> = (binding.instance?.$ as any).provides[injectionClicksElements as any];
                    const clicksDisabled: Ref<boolean> = (binding.instance?.$ as any).provides[injectionClicksDisabled as any];
                    const slidev: UnwrapNestedRefs<SlidevContext> = (binding.instance?.$ as any).provides[injectionSlidevContext as any];
                    const animateArray = getAnimateArray(el[argumentSymbol]);

                    // Animation disabled
                    if (clicksDisabled.value) {
                        return;
                    }
                    if (!animateArray.length) {
                        el.setAttribute(attributeName, '');
                        return;
                    }

                    // Get page number
                    const pageNumber = Number(
                        Array.from(el.closest('.slidev-page')?.classList ?? [])
                             .filter(c => c.startsWith('slidev-page-'))?.[0]?.slice(12)
                    );
                    if (isNaN(pageNumber)) {
                        return;
                    }

                    // Animation variables
                    let attributeValue = el.getAttribute(attributeName);
                    const setAttribute = (limit) => {
                        const value = animateArray.slice(0, limit).join(' ').trim();
                        if (value != attributeValue) {
                            const currClick = value.length ? Number(value.split(' ').pop()) : -1;
                            const prevClick = attributeValue?.length ? Number(attributeValue?.split(' ').pop()) : -1;

                            attributeValue = value;
                            el.setAttribute(attributeName, value);
                            pluginsOnClicked(el, node, currClick, prevClick);
                        }
                    };
                    
                    // Setup automatic clicks value
                    if (clicksElements?.value.length < animateArray.length - 1) {
                        if (clicksElements?.value) {
                            const id = idPrefix + makeId();
                            const ids = [...Array(animateArray.length - 1 - clicksElements.value.length).keys()].map(i => id + i);
                            clicksElements.value.push(...ids);
                            
                            onUnmounted(() => ids.forEach(i => {
                                const index = clicksElements.value.indexOf(i);
                                if (index >= 0) {
                                    clicksElements.value.splice(index, 1);
                                }
                            }), binding.instance as any);
                        }
                    }

                    // Setup clicks watcher
                    watch(
                        [() => slidev.nav.currentPage, clicks],
                        ([newPage, newClick], [oldPage, oldClick]) => {
                            // Set animattr value to start/end if previous/next page
                            if (newPage < pageNumber) {
                                setAttribute(0);
                                return;
                            } else if (newPage > pageNumber) {
                                setAttribute(undefined);
                                return;
                            }

                            // Update animattr value based on click
                            // We do not run an update when going backwards from a next slide, as this usually triggers unwanted animations
                            if (!oldPage || oldPage <= newPage) {
                                setTimeout(() => {setAttribute(Math.max(0, newClick) + 1)});
                            }
                        },
                        { immediate: true },
                    );
                },
            });
        }
    }
}
