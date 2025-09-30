# Part 3: First Algorithm Integration (Bubble Sort)
1. bubble.js
 - Implemented Bubble Sort as a function that emits event sequences (init, compare, swap, clear, markSortedEnd, done).
2. main.js (updated)
 - Replaced the mock generator with real bubbleSort() output
 - Handled new event types (markSortedEnd, done) for persistent sorted markers and final styling
 - Updated clearHighlights() to reapply markers and completion styling