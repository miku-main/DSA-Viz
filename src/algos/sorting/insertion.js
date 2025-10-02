/**
 * Insertion Sort (event-emitting)
 * Events:
 *  - init: initial array
 *  - compare: comparing key with a[j]
 *  - shift: move a[j] -> a[j + 1]
 *  - insert: place key at position j + 1
 *  - markSortedPrefix: indices [0...i] are now sorted
 *  - clear: clear transient highlights
 *  - done: finished
 * 
 * WHY events: decouple logic from rendering; deterministic replays; easy step/seek
 */

export function insertionSort(arr) {
    const a = arr.slice();
    const events = [];
    let t = 0;

    // Display code refernece lines (see main.js lines array)
    // 1: function..., 2: const a=..., 3: for i...
    // 4:   const key..., 5: let j = i - 1;
    // 6:   while (j >= 0 && a[j] > key) {
    // 7:       a[j + 1] = a[j];    // shift
    // 8:       j--;
    // 9:   }
    //10:   a[j + 1] = key;         // insert
    //11:   // prefix [0...i] sorted
    //12:}
    //13:return a;

    events.push({ t: t++, type: 'init', payload: { a: a.slice(), line: 2} });

    for (let i = 1; i < a.length; i++) {
        const key = a[i];
        let j = i - 1;
        events.push({ t: t++, type: 'clear', payload: {} });
        // highlight taking key (lines 4-5)
        events.push({ t: t++, type: 'compare', payload: { i, j, key, line: 4 } });
        
        while (j >= 0 && a[j] > key) {
            // compare key with a[j] (line 6)
            events.push({ t: t++, type: 'compare', payload: { i, j, key, line: 6 } });
            // shift a[j] to the right (line 7)
            a[j + 1] = a[j];
            events.push({ t: t++, type: 'shift', payload: { from: j, to: j + 1, a: a.slice(), line: 7 } });
            j--;
            events.push({ t: t++, type: 'clear', payload: { line: 8 } });
        }

        // insert key (line 10)
        a[j + 1] = key;
        events.push({ t: t++, type: 'insert', payload: { index: j + 1, value: key, a: a.slice(), line: 10 } });

        // Mark prefix [0...i] sorted (line 11)
        events.push({ t: t++, type: 'markSortedPrefix', payload: { upTo: i, line: 11 } });
    }

    events.push({ t: t++, type: 'done', payload: { line: 13 } });
    return events;
}