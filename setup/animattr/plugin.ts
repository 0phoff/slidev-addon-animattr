/*
 *  Plugin Code
 */
import type { DirectiveBinding, VNode } from 'vue';


/*
 *  TYPES
 */
export interface Plugin {
    onCreated: (el: HTMLElement, binding: DirectiveBinding, node: VNode) => boolean,
    onClicked: (el: HTMLElement, node: VNode, click: number, prevClick: number) => undefined,
}


/*
 *  CONSTANTS
 */
const plugins: Plugin[] = [];
const pluginSymbol = Symbol('animattr-plugins');


/*
 *  FUNCTIONS
 */
export function registerPlugin(name: string, plugin: Plugin) {
    console.debug(`[AnimAttr] registered plugin: ${name}`);
    plugins.push(plugin);
}

export function pluginsOnCreated(el: HTMLElement, binding: DirectiveBinding, node: VNode) {
    const enabled: boolean[] = [];
    for (const plugin of plugins) {
        enabled.push(plugin.onCreated(el, binding, node))
    }
    el[pluginSymbol] = enabled;
}

export function pluginsOnClicked(el: HTMLElement, node: VNode, click: number, prevClick: number) {
    const enabled: boolean[] = el[pluginSymbol] ?? [];
    for (let i = 0 ; i < enabled.length ; i++) {
        if (enabled[i]) {
            plugins[i].onClicked(el, node, click, prevClick);
        }
    }
}