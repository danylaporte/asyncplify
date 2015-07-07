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
        if (this.scheduler) this.scheduler.schedule(this);
    },
    close: function () {
        this.sink = NoopSink.instance;
        if (this.scheduler) this.scheduler.close();
        this.scheduler = null;
    }
};