const bound = (value, name, min, max) => {
    if (!Number.isFinite(value) || value < min || value > max)
        throw new RangeError(name);
    return value;
};
// A live control needs current position and velocity, not an ever-growing event history.
export class SpringChannel {
    constructor(value, atSeconds, options = {}) {
        this.speed = 0;
        this.origin = this.destination = bound(value, 'value', -1e12, 1e12);
        this.epoch = bound(atSeconds, 'atSeconds', 0, Number.MAX_SAFE_INTEGER);
        this.w = bound(options.w ?? 22, 'w', 0.001, 10000);
        this.positionTolerance = bound(options.positionTolerance ?? 0.001, 'positionTolerance', 1e-12, 1e6);
        this.velocityTolerance = bound(options.velocityTolerance ?? 0.001, 'velocityTolerance', 1e-12, 1e6);
    }
    get target() { return this.destination; }
    sample(atSeconds) {
        bound(atSeconds, 'atSeconds', this.epoch, Number.MAX_SAFE_INTEGER);
        const dt = atSeconds - this.epoch;
        const u = this.w * dt;
        const offset = this.origin - this.destination;
        if (u > 745)
            return { value: this.destination, velocity: 0, moving: false };
        const e = Math.exp(-u);
        const a = this.speed + this.w * offset;
        const remaining = e * (offset + a * dt);
        const velocity = e * (this.speed - this.w * a * dt);
        // A zero crossing is not rest; the envelope guards later rebound.
        const positionEnvelope = e * (1 + u) * (Math.abs(offset) + Math.abs(this.speed) / this.w);
        const velocityEnvelope = this.w * positionEnvelope + e * Math.abs(this.speed);
        const moving = positionEnvelope > this.positionTolerance || velocityEnvelope > this.velocityTolerance;
        return moving
            ? { value: this.destination + remaining, velocity, moving }
            : { value: this.destination, velocity: 0, moving: false };
    }
    retarget(to, atSeconds, w = this.w) {
        bound(to, 'target', -1e12, 1e12);
        bound(w, 'w', 0.001, 10000);
        const current = this.sample(atSeconds);
        this.origin = current.value;
        this.speed = current.velocity;
        this.destination = to;
        this.epoch = atSeconds;
        this.w = w;
    }
    release(from, velocity, to, atSeconds, w = this.w) {
        bound(from, 'from', -1e12, 1e12);
        bound(velocity, 'velocity', -1e12, 1e12);
        bound(to, 'target', -1e12, 1e12);
        bound(atSeconds, 'atSeconds', this.epoch, Number.MAX_SAFE_INTEGER);
        bound(w, 'w', 0.001, 10000);
        this.origin = from;
        this.speed = velocity;
        this.destination = to;
        this.epoch = atSeconds;
        this.w = w;
    }
    jump(to, atSeconds) { this.release(to, 0, to, atSeconds); }
}
