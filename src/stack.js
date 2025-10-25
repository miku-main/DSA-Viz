/**
 * Stack visualizer events (top of stack = end of array)
 * 
 * Events:
 * - init: initial array
 * - push: push {index, value, a}
 * - pop: pop {index, value, a}
 * - clear: clear transient highlights
 * - error: underflow or invalid input {message}
 * 
 * Each call returns a short event list, can feed into Timeline
 */

export function stackInit(arr = []) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    return [{ t: 0, type: 'init', payload: { a, line: 2 } }];
}

/**
 * @param {number[]} arr - current stack array (not mutated)
 * @param {'push'|'pop'} action
 * @param {number} [value] - required for push
 * @returns {Array<{t:number,type:string,payload:any}>}
 */

export function stackOp(arr, action, value) {
    const a = arr.slice();
    const events = [];
    let t = 0;

    // Optional code-pane line hints if add a stack code block later
    const L = { push: 7, pop: 10};

    if (action === 'push') {
        if (Number.isNaN(Number(value))) {
            return [{ t: 0, type: 'error', payload: { message: 'Enter a number to push.' } }];
        }
        const idx = a.length;
        a.push(Number(value));
        events.push({ t: t++, type: 'push', payload: { index: idx, value: Number(value), a: a.slice(), line: L.push } });
        events.push({ t: t++, type: 'clear', payload: {} });
        return events;
    }

    if (action === 'pop') {
        if (a.length === 0) {
            return [{ t: 0, type: 'error', payload: { message: "Stack underflow (empty stack)." } }];
        }
        const idx = a.length - 1;
        const val = a[idx];
        a.pop();
        events.push({ t: t++, type: 'pop', payload: { index: idx, value: val, a: a.slice(), line: L.pop } });
        events.push({ t: t++, type: 'clear', payload: {} });
        return events;
    }

    return [{ t: 0, type: 'error', payload: { message: `Unknown action: ${action}` } }];
}