/**
 * Merge Sort (event-emitting)
 * 
 * Events:
 *  - init: inital array
 *  - markSubarray: focus [L...R] currently being processed (for visual guidance)
 *  - compare: comparing left and right values during merge
 *  - overwrite: write value into a[k] from temp buffer
 *  - clear: clear transient highlights
 *  - done: finished
 * 
 * WHY this shape:
 *  - Students see the key actions: subarray focus, comparisons, and writes back
 *  - Deterministic events = easy step/seek/play across the whole recursion
 */

export function mergeSort(arr) {
    const a = arr.slice();
    const events = [];
    let t = 0;

    // Teach-mode line hints (see code pane lines in main.js)
    // 1:function..., 2:const a=..., 3:const temp=Array(a.length)
    // 4: function merge(l, m, r) {...} [we'll map compares/overwrites here]
    // 5: function sort(l, r) {...} [recursion + markSubarray]
    // ...
    // 17: return a;

    events.push({ t: t++, type: 'init', payload: {a: a.slice(), line: 2 } });

    const temp = Array(a.length); // line 3

    function merge(l, m, r) {
        let i = l, j = m + 1, k = l;

        // copy current segment to temp
        for (let p = l; p <= r; p++) temp[p] = a[p];

        while (i <= m && j <= r) {
            // compare left temp[i] vs right temp[j] (line 4)
            events.push({ t: t++, type: 'compare', payload: { i, j, line: 4 } });
            if (temp[i] <= temp[j]) {
                a[k] = temp[i];
                events.push({ t: t++, type: 'overwrite', payload: { k, value: temp[i], a: a.slice(), line: 4 } });
                i++;
            } else {
                a[k] = temp[j];
                events.push({ t: t++, type: 'overwrite', payload: { k, value: temp[j], a: a.slice(), line: 4 } });
                j++;
            }
            k++;
            events.push({ t: t++, type: 'clear', payload: {} });
        }

        // copy rest of left side (if any)
        while (i <= m) {
            a[k] = temp[i];
            events.push({ t: t++, type: 'overwrite', payload: { k, value: temp[i], a: a.slice(), line: 4 } });
            i++; k++;
        }

        // copy rest of right side (if any)
        while (j <= r) {
            a[k] = temp[j];
            events.push({ t: t++, type: 'overwrite', payload: { k, value: temp[j], a: a.slice(), line: 4 } });
            j++; k++;
        }
    }

    function sort(l, r) {
        // Visually focus the current subarray [l...r] (line 5)
        events.push({ t: t++, type: 'markSubarray', payload: { l, r, line: 5 } });

        if (l >= r) {
            // Single element segement - nothing to merge
            return;
        }
        const m = Math.floor((l + r) / 2);
        sort(l, m);
        sort(m + 1, r);
        merge(l, m, r);
    }

    sort(0, a.length - 1);

    events.push({ t: t++, type: 'done', payload: { line: 17 } });
    return events;
}