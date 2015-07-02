Asyncplify.prototype.timeout = function (options) {
    return new Asyncplify(Timeout, options, this);
}

function Timeout(options, sink, source) {
    this.delay = typeof options === 'number' ? options : options && options.delay || 0;
    this.dueTime = options instanceof Date ? options : options && options.dueTime;
    this.other = options instanceof Asyncplify ? options : (options && options.other || Asyncplify.throw(new Error('Timeout'))); 
    this.schedulerContext = (options && options.scheduler || schedulers.timeout)();
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    this.schedulerContext.schedule(this);
    source._subscribe(this);
}

Timeout.prototype = {
    action: function () {
        this.closeSource();
        this.closeSchedulerContext();
        this.other._subscribe(this);
    },
    close: function () {
        this.sink = null;
        this.closeSource();
        this.closeSchedulerContext();  
    },
    closeSource: closeSource,
    closeSchedulerContext: closeSchedulerContext,
    emit: function (value) {
        this.closeSchedulerContext();
        this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;
        this.closeSchedulerContext();
        this.endSink(err);
    },
    endSink: endSink,
    error: function (err) {
        this.closeSource();
        this.closeSchedulerContext();
        this.endSink(err);
    }
};