Asyncplify.interval = function (options) {
    return new Asyncplify(Interval, options);
};

function Interval(options, sink) {
    var self = this;
    
    this.i = 0;
    this.item = {
        action: function () { self.action(); },
        delay: options && options.delay || typeof options === 'number' && options || 0,
        error: function (err) { self.handleError(err); }
    };
    this.schedulerContext = (options && options.scheduler || schedulers.timeout)();
    this.sink = sink;
    this.sink.source = this;

    this.schedulerContext.schedule(this.item);
}

Interval.prototype = {
    action: function () {
        if (this.sink) {
            this.sink.emit(this.i++);
            
            if (this.schedulerContext)
                this.schedulerContext.schedule(this.item);
        }
    },
    close: function () {
        this.sink = null;
        
        if (this.schedulerContext) {
            this.schedulerContext.close();
            this.schedulerContext = null;
        }
    },
    handleError: function (err) {
        if (this.schedulerContext) {
            this.schedulerContext.close();
            this.schedulerContext = null;
            
            if (this.sink) {
                this.sink.end(err);
                this.sink = null;
            }
        }
    }
};