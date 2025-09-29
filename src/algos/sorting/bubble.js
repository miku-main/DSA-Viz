/**
 * Bubble Sort
 * 
 * WHAT IT DOES:
 * - Runs bubble sort on a COPY of the input array
 * - Emits a sequence of events describing each step:
 *   - init             : provide initial array to draw
 *   - compare          : highlight two indices i, j being compared
 *   - swap             : values at i, j were swapped; payload carries the new array snapshot
 *   - clear            : clear temporary highlights
 *   - markSortedEnd    : at the end of each outer pass, the last element is in correct place
 *   - done             : algorithm finished
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

/**
 * @param {number[]} arr - input array (not mutated)
 * @returns {Array<{t:number,type:string,payload:any}>}
 */

export function bubbleSort(arr) {
    const a = arr.slice() // never mutate the caller's array
    /** @type {Array<{t:number,type:string,payload:any}>} */
    const events = [];

    let t = 0;

    // Initial state so the renderer can draw bars immediately
    events.push({ t: t++, type: 'init', payload: { a: a.slice() } });

    // Bubble sort with early-exit optimization (Better average perf, good for teaching moment)
    let swapped = true;
    for (let i = 0; i < a.length - 1 && swapped; i++) {
        swapped = false;

        // Inner loop compares adjacent pairs up to (length - 1 - i)
        for (let j = 0; j < a.length - 1 - i; j++) {
            // Show which pair it is comparing (visual highlight)
            events.push({ t: t++, type: 'compare', payload: { i: j, j: j + 1 } });

            if (a[j] > a[j + 1]) {
                // Swap in the algorithm model
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swapped = true;

                // Emit a swap with a full snapshot (keeps renderer simple & robust)
                events.push({
                    t: t++,
                    type: 'swap',
                    payload: { i: j, j: j + 1, a: a.slice() },
                });
            }

            // Clear the highlight so each step is distinct
            events.push({ t: t++, type: 'clear', payload: {} });
        }
        // After each outer pass, the last element is in correct place
        // Helps learners see progress
        events.push({
            t: t++,
            type: 'markSortedEnd',
            payload: { index: a.length - 1 - i },
        });
    }
    // Final signal to UI that it is done (enable final styling)
    events.push({ t: t++, type: 'done', payload: {} });

    return events;
}

