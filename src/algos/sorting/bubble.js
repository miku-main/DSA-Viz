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
    // init -> show array; code-pane line 2 (copy input)
    events.push({ t: t++, type: 'init', payload: { a: a.slice(), line: 2 } });

    // Bubble sort with early-exit optimization (Better average perf, good for teaching moment)
    let swapped = true; // line 3
    for (let i = 0; i < a.length - 1 && swapped; i++) { // line 4
        swapped = false; // line 5

        // Inner loop compares adjacent pairs up to (length - 1 - i)
        for (let j = 0; j < a.length - 1 - i; j++) { // line 6
            // Show which pair it is comparing (visual highlight)
            // compare -> line 8 (the if check in the display code)
            events.push({ t: t++, type: 'compare', payload: { i: j, j: j + 1, line: 8 } });

            if (a[j] > a[j + 1]) { // line 8 (true branch)
                // Swap in the algorithm model
                [a[j], a[j + 1]] = [a[j + 1], a[j]]; // line 9
                swapped = true; // line 10

                // Emit a swap with a full snapshot (keeps renderer simple & robust)
                events.push({
                    t: t++,
                    type: 'swap',
                    payload: { i: j, j: j + 1, a: a.slice(), line: 9 },
                });
            }

            // Clear the highlight so each step is distinct, no specific code line
            events.push({ t: t++, type: 'clear', payload: {} });
        }
        // After each outer pass, the last element is in correct place
        // Helps learners see progress
        // End of outer pass -> mark the sorted tail; line 13 (comment line)
        events.push({
            t: t++,
            type: 'markSortedEnd',
            payload: { index: a.length - 1 - i, line: 13 },
        });
    }
    // Final signal to UI that it is done (enable final styling)
    // done -> highlight return; line 15
    events.push({ t: t++, type: 'done', payload: { line: 15 } });

    return events;
}

