Asyncplify.prototype.timeout = function (options) {
    return new Asyncplify(Timeout, options, this);
}

function Timeout(options, on, source) {
    var self = this;
    var other = options instanceof Asyncplify ? options : (options && options.other || Asyncplify.throw(new Error('Timeout')));

    this.on = on;
    this.scheduler = (options && options.scheduler || schedulers.timeout)();
    this.source = null;

    on.source = this;

    this.scheduler.schedule({
        action: function () {
            self.source.setState(CLOSED);
            other._subscribe(self);
        },
        delay: typeof options === 'number' ? options : options && options.delay || 0,
        dueTime: options instanceof Date ? options : options && options.dueTime
    });
    source._subscribe(this);
}

Timeout.prototype = {
    closeScheduler: function () {
        if (this.scheduler) {
            this.scheduler.setState(CLOSED);
            this.scheduler = null;
        }
    },
    emit: function (value) {
        this.closeScheduler();
        this.on.emit(value);
    },
    end: function (err) {
        this.closeScheduler();
        this.on.end(err);
    },
    setState: function (state) {
        this.scheduler && this.scheduler.setState(state);
        this.source.setState(state);
    }
}