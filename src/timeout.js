Asyncplify.prototype.timeout = function (options) {
    return new Asyncplify(Timeout, options, this);
}

function Timeout(options, sink, source) {
    this.delay = typeof options === 'number' ? options : options && options.delay || 0;
    this.dueTime = options instanceof Date ? options : options && options.dueTime;
    this.other = options instanceof Asyncplify ? options : (options && options.other || Asyncplify.throw(new Error('Timeout'))); 
    this.scheduler = (options && options.scheduler || schedulers.timeout)();
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.subscribable = source;

    this.scheduler.schedule(this);
    
    if (this.subscribable) this.subscribable._subscribe(this);
    this.subscribable = null;
}

Timeout.prototype = {
    action: function () {
        this.scheduler.close();
        this.subscribable = this.scheduler = null;
        if (this.source) this.source.close();
        this.other._subscribe(this);
    },
    close: function () {
        if (this.source) this.source.close();
        if (this.scheduler) this.scheduler.close();
        this.scheduler = this.source = null;
        this.sink = NoopSink.instance;
    },
    emit: function (value) {
        if (this.scheduler) this.scheduler.close();
        this.scheduler = null;
        this.sink.emit(value);
    },
    end: function (err) {
        if (this.scheduler) this.scheduler.close();
        this.source = this.scheduler = null;        
        this.sink.end(err);
        this.sink = NoopSink.instance;
    },
    error: function (err) {
        this.scheduler.close();
        if (this.source) this.source.close();
        this.source = this.scheduler = null;
        this.sink.end(err);
        this.sink = NoopSink.instance;
    }
};