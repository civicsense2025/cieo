// One owner controls the clock, so cancelling a view cannot leave an idle frame loop behind.
export class FrameScheduler {
    constructor(environment, capacity = 256) {
        this.environment = environment;
        this.capacity = capacity;
        this.jobs = new Set();
        this.handle = null;
        this.epoch = 0;
        this.ticking = false;
        this.closed = false;
        this.lastTime = 0;
        this.tick = (milliseconds) => {
            this.handle = null;
            if (this.closed)
                return;
            if (!Number.isFinite(milliseconds) || milliseconds < this.lastTime) {
                this.report(new RangeError('The frame clock must be finite and monotonic.'));
                this.dispose();
                return;
            }
            this.lastTime = milliseconds;
            if (!this.environment.allowed()) {
                this.sync();
                return;
            }
            this.ticking = true;
            this.epoch += 1;
            try {
                for (const entry of this.jobs) {
                    if (entry.born > this.epoch)
                        continue;
                    try {
                        if (!entry.job.step(milliseconds / 1000))
                            this.finish(entry, 'settled');
                    }
                    catch (error) {
                        this.report(error);
                        this.finish(entry, 'failed');
                    }
                }
            }
            finally {
                this.ticking = false;
                this.ensureFrame();
            }
        };
        if (!Number.isInteger(capacity) || capacity < 1 || capacity > 4096)
            throw new RangeError('capacity');
    }
    get active() { return this.jobs.size; }
    start(job) {
        if (this.closed)
            throw new Error('The scheduler is disposed.');
        if (this.jobs.size >= this.capacity)
            throw new RangeError('The scheduler is at capacity.');
        const entry = { job, born: this.epoch + 1 };
        if (!this.environment.allowed()) {
            this.finish(entry, 'gated', true);
            return () => { };
        }
        this.jobs.add(entry);
        this.ensureFrame();
        return () => { this.finish(entry, 'cancelled'); this.cancelIdleFrame(); };
    }
    sync() {
        if (!this.environment.allowed()) {
            // Clear first because finish handlers are allowed to cancel other jobs.
            const entries = [...this.jobs];
            this.jobs.clear();
            this.cancelIdleFrame();
            for (const entry of entries)
                this.finish(entry, 'gated', true);
        }
    }
    dispose() {
        if (this.closed)
            return;
        this.closed = true;
        const entries = [...this.jobs];
        this.jobs.clear();
        this.cancelIdleFrame();
        for (const entry of entries)
            this.finish(entry, 'disposed', true);
    }
    finish(entry, reason, detached = false) {
        if (!detached && !this.jobs.delete(entry))
            return;
        try {
            entry.job.finish?.(reason);
        }
        catch (error) {
            this.report(error);
        }
    }
    report(error) {
        try {
            this.environment.onError(error);
        }
        catch { /* A reporter must not strand other owners' jobs. */ }
    }
    ensureFrame() {
        if (!this.closed && !this.ticking && this.jobs.size && this.handle === null) {
            this.handle = this.environment.request(this.tick);
        }
    }
    cancelIdleFrame() {
        if (!this.jobs.size && this.handle !== null) {
            this.environment.cancel(this.handle);
            this.handle = null;
        }
    }
}
