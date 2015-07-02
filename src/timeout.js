Asyncplify.prototype.timeout = function (options) {
    return new Asyncplify(Timeout, options, this);
}

function Timeout(options, sink, source) {
    var self = this;
    var other = options instanceof Asyncplify ? options : (options && options.other || Asyncplify.throw(new Error('Timeout')));

    this.schedulerContext = (options && options.scheduler || schedulers.timeout)();
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    this.schedulerContext.schedule({
        action: function () {
            self.closeSource();
            other._subscribe(self);
        },
        delay: typeof options === 'number' ? options : options && options.delay || 0,
        dueTime: options instanceof Date ? options : options && options.dueTime,
        error: function (err) { self.error(err); }
    });
    
    source._subscribe(this);
}

Timeout.prototype = {
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
        this.endSink(err);
        this.closeSchedulerContext();
    },
    endSink: endSink,
    error: function (err) {
        this.closeSource();
        this.endSink(err);
        this.closeSchedulerContext();
    }
};