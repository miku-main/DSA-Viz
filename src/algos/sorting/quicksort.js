/**
 * Quick Sort (Lomuto partition, event-emitting)
 * 
 * Events:
 *  - init: initial array (line 2)
 *  - markSubarray: focus [low...high] we're partitioning (line 4/5)
 *  - setPivot: highlight pivot index p (line 6)
 *  - compareWithPivot: compare a[j] vs pivot (line 7)
 *  - swap: swap i <-> j or place pivot (line 8/10)
 *  - clear: clear transient highlights
 *  - markSortedIndex: pivot placed at its final sorted index (line 10)
 *  - done: all sorted (line 13)
 * 
 * WHY: Makes pivot choice + partition mechanics visible and locks in final positions.
 */

export function quickSort(arr) {
    const a = arr.slice();
    const events = [];
    let t = 0;

    // Teach-mode line hints (see main.js code pane)
    // 1:function quickSort(arr) {
    // 2:  const a = arr.slice();
    // 3:  function partition(low, high) {
    // 4:    const p = a[high];        // pivot
    // 5:    let i = low;
    // 6:    for (let j = low; j < high; j++) {
    // 7:      if (a[j] <= p) {         // compareWithPivot
    // 8:        swap(a, i, j);         // swap inside partition
    // 9:        i++;
    //10:    }                          // after loop: place pivot
    //11:    swap(a, i, high);          // final pivot place
    //12:    return i;
    //13:  }                            // done is line 13 for return a

    events.push({ t: t++, type: 'init', payload: { a: a.slice(), line: 2 } });

    function swap(i, j) {
        [a[i], a[j]] = [a[j], a[i]];
        events.push({ t: t++, type: 'swap', payload: { i, j, a: a.slice(), line: 8 } });
    }

    function partition(low, high) {
        // focus the subarray
        events.push({ t: t++, type: 'markSubarray', payload: { l: low, r: high, line: 3 } });

        const pIdx = high;  // pivot at end (Lomuto)
        const pivot = a[pIdx];
        events.push({ t: t++, type: 'setPivot', payload: { p: pIdx, value: pivot, line: 4 } });

        let i = low;    // place for next <= pivot
        for (let j = low; j < high; j++) {
            events.push({ t: t++, type: 'compareWithPivot', payload: { j, p: pIdx, line: 7 } });
            if (a[j] <= pivot) {
                if (i !== j) swap(i, j);
                else {
                    // still count as a no-op step for clarity; emit clear for rhythm
                    events.push({ t: t++, type: 'clear', payload: {} });
                }
                i++;
            } else {
                events.push({ t: t++, type: 'clear', payload: {} });
            }
        }

        // Place pivot into its final position
        if (i !== pIdx) swap(i, pIdx);
        events.push({ t: t++, type: 'markSortedIndex', payload: { index: i, line: 11 } });

        return i;
    }

    function qs(low, high) {
        events.push({ t: t++, type: 'markSubarray', payload: { l: low, r: high, line: 5 } });
        if (low >= high) return;
        const p = partition(low, high);
        qs(low, p - 1);
        qs(p + 1, high);
    }

    qs(0, a.length - 1);

    events.push({ t: t++, type: 'done', payload: { line: 14 } });
    return events;
}