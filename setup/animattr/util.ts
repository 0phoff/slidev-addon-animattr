/*
 *  Utilitary Functions
 */
import type { DirectiveBinding, VNode } from 'vue';


/*
 *  FUNCTIONS
 */
export function getName(node: VNode): string {
    return (node as any)?.ctx?.type?.__file?.endsWith('.md') ? String(node.type) : (node as any)?.ctx?.type?.__name ?? String(node.type);
}

export function parseObject(text: string): any {
    const jsonText = text
        .replace(/(\w+:)|(\w+ :)/g, s => '"' + s.substring(0, s.length-1) + '":')
        .replace(/'/g, '"')
        ;
        
    try {
        return JSON.parse(jsonText);
    }
    catch(e) {
        console.error(`[AnimAttr] Could not parse object string: ${text}`);
        return null;
    }
}

export function resolveArgument(key: string, binding: DirectiveBinding, node: VNode): any {
    if (binding.value && typeof(binding.value) === 'object' && !Array.isArray(binding.value)) {
        if (key in binding.value) {
            return binding.value[key];
        }
    }

    if (node.props) {
        if (key in node.props) {
            return node.props[key];
        }

        const dataKey = `data-${key}`;
        if (dataKey in node.props) {
            return node.props[dataKey];
        }
    }
}
