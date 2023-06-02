import { watch, onUnmounted } from 'vue';
import { injectionClicks, injectionClicksElements, injectionClicksDisabled, injectionSlidevContext } from "@slidev/client/constants.ts"

const attributeName = 'data-animattr';
const idPrefix = 'animattr-';

function makeId(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length

    const result = []
    for (let i = 0; i < length; i++)
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))

    return result.join('')
}

function getAnimateArray(binding) {
    if (Array.isArray(binding.value)) {
        // Argument is an array with click indices: [1, 3, 4, 5, 9]
        const value = [...binding.value].sort();
        const max = value[value.length - 1];
        const animateArray = Array(max).fill('');
        for (let i = 0; i < value.length; i++) {
            animateArray[value[i]] = i;
        }

        return animateArray;
    } else if (typeof binding.value === 'object') {
        // Argument is object with start/stop/stride
        const start = binding.value.start ?? 1;
        const stop = binding.value.stop ?? start;
        const stride = binding.value.stride ?? 1;
        const animateArray = Array(stop).fill('');
        for (let j = 0, i = start; i <= stop; i += stride) {
            animateArray[i] = j++;
        }

        return animateArray;
    } else {
        // Argument is number
        if (binding.modifiers?.['on-load']) {
            return [...Array(Number(binding.value)).keys()];
        } else {
            return ['', ...Array(Number(binding.value)).keys()];
        }
    }
}

export default function createAnimateDirective() {
    return {
        install(app) {
            app.directive('animattr', {
                beforeMount(el, binding) {
                    const clicksDisabled = binding.instance?.$.provides[injectionClicksDisabled];
                    
                    if (binding.value && clicksDisabled.value) {
                        // Clicks disabled -> setup end state
                        const attributeValue = getAnimateArray(binding).join(' ').trim();
                        el.setAttribute(attributeName, attributeValue);
                    } else {
                        // Clicks enabled -> setup attribute to empty string
                        el.setAttribute(attributeName, '');
                    }
                },

                mounted(el, binding) {
                    // Get SliDev injections
                    const clicks = binding.instance?.$.provides[injectionClicks];
                    const clicksElements = binding.instance?.$.provides[injectionClicksElements];
                    const clicksDisabled = binding.instance?.$.provides[injectionClicksDisabled];
                    const slidev = binding.instance?.$.provides[injectionSlidevContext];

                    // Animation disabled
                    if (clicksDisabled.value) {
                        return;
                    }
                    if (!binding.value) {
                        el.setAttribute(attributeName, '');
                        return;
                    }

                    // Get page number
                    const pageNumber = Number(
                        Array.from(el.closest('.slidev-page')?.classList ?? [])
                            .filter(c => c.startsWith('slidev-page-'))
                            ?.[0]?.slice(12)
                    )
                    if (isNaN(pageNumber)) {
                        return;
                    }

                    // Get animation variables
                    let attributeValue = el.getAttribute(attributeName);
                    const animateArray = getAnimateArray(binding);
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
                                index = clicksElements.indexOf(i);
                                if (index >= 0) {
                                    array.splice(index, 1);
                                }
                            }), binding.instance);
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
