Asyncplify.prototype.debounce = function (options) {
    return new Asyncplify(Debounce, options, this);
};

function Debounce(options, sink, source) {
    this.delay = options && options.delay || typeof options === 'number' && options || 0;
    this.itemPending = false;
    this.scheduler = (options && options.scheduler || schedulers.timeout)();
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.value = undefined;
    
    source._subscribe(this);
}

Debounce.prototype = {
    action: function () {
        var v = this.value;
        this.itemPending = false;
        this.value = undefined;
        this.sink.emit(v);
        
        if (!this.source) {
            if (this.scheduler) this.scheduler.close();
            this.scheduler = null;
            this.sink.end(null);
            this.sink = NoopSink.instance;
        }
    },
    close: function () {
        if (this.source) this.source.close();
        if (this.scheduler) this.scheduler.close();
        this.source = this.scheduler = this.value = null;
        this.sink = NoopSink.instance;  
    },
    emit: function (value) {
        this.itemPending = true;
        this.value = value;
        
        if (this.scheduler) {
            this.scheduler.close();
            this.scheduler.schedule(this);
        }
    },
    end: function (err) {
        this.source = null;
        debugger;

        if (err || !this.itemPending) {
            if (this.scheduler) this.scheduler.close();
            this.scheduler = null;
            this.value = undefined;
            this.sink.end(err);
            this.sink = NoopSink.instance;
        }
    }
};