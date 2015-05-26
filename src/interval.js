Asyncplify.interval = function (options) {
    return new Asyncplify(Interval, options)
}

function Interval(options, on) {
    this.i = 0;
    this.item = {
        action: noop,
        delay: options && options.delay || typeof options === 'number' && options || 0
    };
    this.itemPending = true;
    this.scheduler = (options && options.scheduler || schedulers.timeout)();
    this.on = on;
    this.state = RUNNING;

    on.source = this;
    var self = this;
    
    this.scheduler.itemDone = function (err) { self.scheduledItemDone(err); };     
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
                this.scheduler.setState(state);
            }
        }
    }
}
