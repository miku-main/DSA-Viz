/**
 * Animator
 * - Drives time forward using requestAnimationFram (rAF)
 * - Consumes a Timeline and calls `draw(eventsForThisTick)` each frame
 * - Supports Play/Pause/Step/Reset and a speed multipler
 */

export class Animator {
    constructor({ draw, onTick } = {}) {
      this.draw = draw || (() => {});
      this.onTick = onTick || (() => {});
      this.timeline = null;  // set via setTimeline()
      this.t = 0;            // logical time (ticks)
      this.speed = 1;        // 1 = normal speed
      this.playing = false;
      this._boundLoop = this._loop.bind(this);
    }

    setTimeline(timeline) {
        this.timeline = timeline;
        this.t = 0;
    }

    setSpeed(v) {
        this.speed = Math.max(0.1, Number(v) || 1);
    }

    play() {
        if (!this.timeline) return;
        if (this.playing) return;
        this.playing = true;
        requestAnimationFrame(this._boundLoop);
    }

    pause() {
        this.playing = false;
    }

    step() {
        // Advance one logical tick and draw the events at that tick.
        if (!this.timeline) return;
        this._tick(1);
    }

    reset() {
        // Go back to time 0 and clear the screen via a zero-event draw.
        this.t = 0;
        this.timeline?.seek(0);
        this.draw([]);
        this.onTick(this.t, []);
    }

    _loop() {
        if (!this.playing) return;
        this._tick(this.speed);
        requestAnimationFrame(this._boundLoop);
    }

    _tick(dt) {
        this.t += dt;
        // Get all events whose tick <= current t (integer boundary semantics via Timeline)
        const events = this.timeline?.next(this.t) || [];
        this.draw(events);
        this.onTick(this.t, events);
    }
}  