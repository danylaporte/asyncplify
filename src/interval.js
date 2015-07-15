Asyncplify.interval = function (options) {
    return new Asyncplify(Interval, options);
};

function Interval(options, sink) {
    this.i = 0;
    this.delay = options && options.delay || typeof options === 'number' && options || 0;
    this.scheduler = (options && options.scheduler || schedulers.timeout)();
    this.sink = sink;
    this.sink.source = this;

    this.scheduler.schedule(this);
}

Interval.prototype = {
    action: function () {
        this.sink.emit(this.i++);
        this.scheduler.schedule(this);
    },
    setState: function (state) {
        this.scheduler.setState(state);
    }
};