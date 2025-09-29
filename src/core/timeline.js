/**
 * Timeline
 * - Holds an ordered list of events: { t:number, type:string, payload:any }
 * - next(now) returns events that occur up to floor(now) that haven't emitted yet
 * - seek(0) resets the read pointer to replay from the start
 */

export class Timeline {
    constructor(events = []) {
        // Ensure events are sorted by tick
        this.events = [...events].sort((a, b) => a.t - b.t);
        this._idx = 0; // read pointer
        this._lastTick = -Infinity;
    }

    next(now) {
        const tick = Math.floor(now);
        const out = [];
        // Only move forward when entering a new integer tick
        if (tick === this._lastTick) return out;
        this._lastTick = tick;

        while (this._idx < this,events.length && this.events[this._idx].t <= tick) {
            out.push(this.events[this._idx++]);
        }
        return out;
    }

    seek(tick = 0) {
        // Reset pointer to first event with t >= tick
        this._idx = 0;
        this._lastTick = Math.floor(tick) - 1;
        while (this._idx < this.events.length && this.events[this._idx].t < tick) {
            this._idx++;
        }
    }
}