import { watch, onUnmounted } from 'vue';
import { injectionClicks, injectionClicksElements, injectionClicksDisabled, injectionSlidevContext } from "@slidev/client/constants.ts"

import type { App, DirectiveBinding, VNode, Ref, UnwrapNestedRefs} from 'vue';
import type { SlidevContext } from '@slidev/client/modules/context';

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
const argumentSymbol = Symbol('animattr');


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

function resolveArguments(binding: DirectiveBinding, node: VNode): AnimattrOptions {
    // Parse props
    const props: Partial<AnimattrOptions> = {};
    if (node.props) {
        for (const key of argumentKeys) {
            const dataKey = `data-${key}`;

            if (key in node.props) {
                if (key === 'clicks') {
                    const value = node.props[key];
                    props[key] = typeof value === 'string' ? JSON.parse(value) : value;
                }
                else {
                    props[key] = Number(node.props[key]);
                }
            } else if (dataKey in node.props) {
                if (key === 'clicks') {
                    const value = node.props[dataKey];
                    props[key] = typeof value === 'string' ? JSON.parse(value) : value;
                }
                else {
                    props[key] = Number(node.props[dataKey]);
                }
            }
        }
    }

    // Parse binding args
    const args: Partial<AnimattrOptions> = {};
    if (binding.value) {
        if (Array.isArray(binding.value)) {
            args.clicks = binding.value;
        }
        else if (typeof binding.value === 'object') {
            for (const key of argumentKeys) {
                if (key in binding.value) {
                    if (key === 'clicks') {
                        const value = binding.value[key];
                        args[key] = typeof value === 'string' ? JSON.parse(value) : value;
                    }
                    else {
                        args[key] = Number(binding.value[key]);
                    }
                }
            }
        }
        else {
            args.length = Number(binding.value);
        }
    }

    // Check return value
    const returnValue: AnimattrOptions = {...props, ...args};
    Object.keys(returnValue).forEach(key => returnValue[key] == undefined && delete returnValue[key]);
    const objectName = (node as any)?.ctx?.type?.__file?.endsWith('.md') ? String(node.type) : (node as any)?.ctx?.type?.__name ?? String(node.type);

    if ('clicks' in returnValue && Object.keys(returnValue).some(v => v in ['start', 'stop', 'stride', 'length'])) {
        console.warn(`[${objectName}] AnimAttr options has both "clicks" and "start,stop,length,stride". "clicks" takes precedence.`);
    }
    else if ('length' in returnValue && 'stop' in returnValue) {
        console.warn(`[${objectName}] AnimAttr options has both "stop" and "length". "stop" takes precedence.`);
    }
    else if (!('clicks' in returnValue || 'stop' in returnValue || 'length' in returnValue)) {
        console.warn(`[${objectName}] AnimAttr options has no "clicks", "stop" or "length". No clicks will be added`);
    }

    return returnValue;
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


/*
 *  EXPORT
 */
export default function createAnimattrDirective() {
    return {
        install(app: App) {
            app.directive('animattr', {
                created(el: HTMLElement, binding, node) {
                    el[argumentSymbol] = resolveArguments(binding, node);

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

                mounted(el: HTMLElement, binding) {
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
                            attributeValue = value;
                            el.setAttribute(attributeName, value);
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
                            // We do not run an update when going backwards through slides, as this usually triggers unwanted animations
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
