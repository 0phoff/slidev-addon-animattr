/*
 *  SVG SMIL Plugin
 */
import { registerPlugin } from './plugin';
import { getName, resolveArgument } from './util';

import type { Plugin } from './plugin';
import type { DirectiveBinding, VNode } from 'vue';


/*
 *  TYPES
 */
interface SMILOptions {
    id: string,
    forwards: boolean,
    backwards: boolean,
    state: 'start' | 'stop' | 'finish',
}


/*
 *  CONSTANTS
 */
const smilKey = 'smil';
const smilSymbol = Symbol('animattr-smil');


/*
 *  FUNCTIONS
 */
function getState(modifiers: string): 'start' | 'stop' | 'finish' {
    if (modifiers.includes('+')) {
        return 'start';
    }
    if (modifiers.includes('-')) {
        return 'stop';
    }
    if (modifiers.includes('~')) {
        return 'finish';
    }
    return 'start';
}


/*
 *  PLUGIN
 */
const pluginSMIL: Plugin = {
    onCreated(el: HTMLElement, binding: DirectiveBinding, node: VNode): boolean {
        // Get argument
        let value = resolveArgument(smilKey, binding, node);
        if (value == undefined) {
            return false;
        }

        // Parse argument if string
        if (typeof value === 'string') {
            value = JSON.parse(value.replace(/'/g, '"'));
        }
        
        // Convert array to object
        const arg: Record<number, string> = Array.isArray(value) ? {...value} : (value as Record<number, string>);
    
        // Convert to SMILOptions
        const regex = /([\+\-\~\<\>]*)(.+)/;
        const options: Record<number, SMILOptions[]> = {};
        for (const [key, value] of Object.entries(arg)) {
            options[key] = [];

            for (const optionString of value.split(' ')) {
                const result = regex.exec(optionString);
                if (result) {
                    const modifiers = result[1];
                    const id = result[2];
                    const option: SMILOptions = {
                        id: id,
                        forwards: modifiers.includes('>') || !modifiers.includes('<'),
                        backwards: modifiers.includes('<') || !modifiers.includes('>'),
                        state: getState(modifiers),
                    }
                    options[key].push(option);
                }
            }
        }

        // Remove empty arrays
        for (const [key, value] of Object.entries(options)) {
            if (!value.length) {
                delete options[key];
            }
        }

        // No options -> disable
        if (!Object.keys(options).length) {
            return false;
        }

        el[smilSymbol] = options;
        return true;
    },

    onClicked(el: HTMLElement, node: VNode, click: number, prevClick: number): undefined {
        // Get animation options
        const animations: SMILOptions[] | undefined = el[smilSymbol][click];
        if (animations == undefined) {
            return;
        }

        for (const anim of animations) {
            const animElement = el.querySelector('#' + anim.id);
            if (!animElement) {
                console.error(`[AnimAttr] [SMIL] Could not find #${anim.id} inside of <${getName(node)} />.`);
                continue;
            }
            if (!(animElement instanceof SVGAnimationElement)) {
                console.error(`[AnimAttr] [SMIL] #${anim.id} inside of <${getName(node)} /> is not an SVGAnimationElement.`);
                continue;
            }

            if ((anim.forwards && anim.backwards) || (anim.forwards && prevClick < click) || (anim.backwards && prevClick > click)) {
                console.debug(`[AnimAttr] [SMIL] executing animation #${anim.id}: ${anim.state} (${prevClick} → ${click})`);

                if (anim.state === 'start') {
                    animElement.beginElement();
                }
                else if (anim.state === 'stop') {
                    animElement.endElement();
                }
                else if (anim.state === 'finish') {
                    const eventListener = () => {
                        animElement.endElement();
                        animElement.removeEventListener('repeatEvent', eventListener);
                    }
                    animElement.addEventListener('repeatEvent', eventListener);
                }
            }
        }
    }
};

registerPlugin('SMIL', pluginSMIL);
