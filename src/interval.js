Asyncplify.interval = function (options) {
    return new Asyncplify(Interval, options)
}

function Interval(options, on) {
    this.scheduler = options.scheduler || schedulers.timeout();
    this.on = on;
    this.state = RUNNING;
    this.i = 0;
    this.itemPending = true;

    this.item = {
        action: noop,
        delay: typeof options === 'number' ? options : options.delay || 0,
    };

    on.source = this;
    this.scheduler.itemDone = this.scheduledItemDone.bind(this);
    this.scheduler.schedule(this.item);
}

Interval.prototype = {
    scheduledItemDone: function (err) {
        this.itemPending = false;
        
        if (this.err) {
            this.state = CLOSED;
            this.on.end(err);
        } else {
            this.on.emit(this.i++);
            this.state === RUNNING && this.scheduler.schedule(this.item);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;

            if (state === RUNNING) {
                !this.itemPending && this.scheduler.schedule(this.item);
            } else {
                this.scheduler.setState(this, state);
            }
        }
    }
}
