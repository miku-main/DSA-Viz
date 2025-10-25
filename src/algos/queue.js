/**
 * Queue visualizer events
 * - Visualize front at index 0 and rear at the end of the array.
 * 
 * Events:
 * - init: initial array
 * - enqueue: { index, value, a } // appended at the rear
 * - dequeue: { from, value, a } // removed from front (index 0)
 * - clear: clears transient highlights
 * - error: e.g., dequeue on empty or bad input
 * 
 * Each call returns a short event list you can feed to Timeline for deterministic playback.
 */

export function queueInit(arr = []) {
    const a = Array.isArray(arr) ? arr.slice() : [];
    return [{ t: 0, type: 'init', payload: { a, line: 2 } }];
}

/**
 * @param {number[]} arr - current queue snapshot (not mutated)
 * @param {'enqueue'|'dequeue'} action
 * @param {number} [value] - for enqueue
 * @returns {Array<{t:number,type:string,payload:any}>}
 */
export function queueOp(arr, action, value) {
    const a = arr.slice();
    const events = [];
    let t = 0;

    const L = { enqueue: 7, dequeue: 10 }; // optional code-pane line hints

    if (action === 'enqueue') {
        if (Number.isNaN(Number(value))) {
            return [{ t: 0, type: 'error', payload: { message: 'Enter a number to enqueue.' } }];
        }
        const idx = a.length; // rear index
        a.push(Number(value));
        events.push({ t: t++, type: 'enqueue', payload: { index: idx, value: Number(value), a: a.slice(), line: L.enqueue } });
        events.push({ t: t++, type: 'clear', payload: {} });
        return events;
    }

    if (action === 'dequeue') {
        if (a.length === 0) {
            return [{ t: 0, type: 'error', payload: { message: 'Queue underflow (empty queue).' } }];
        }
        const val = a[0];
        a.shift(); // shifts left visually
        events.push({ t: t++, type: 'dequeue', payload: { from: 0, value: val, a: a.slice(), line: L.dequeue } });
        events.push({ t: t++, type: 'clear', payload: {} });
        return events;
    }

    return [{ t: 0, type: 'error', payload: { message: `Unknown action: ${action}` } }];
}