Asyncplify.prototype.subscribeOn = function (options) {
    return new Asyncplify(SubscribeOn, options, this);
};

function SubscribeOn(options, sink, source) {
    this.origin = source;
    this.sink = sink;
    this.sink.source = this;
    this.scheduler = (typeof options === 'function' ? options : (options && options.scheduler || schedulers.immediate))();
    this.source = null;

    this.scheduler.schedule(this);
}

SubscribeOn.prototype = {
    action: function () {
        this.scheduler.close();
        this.scheduler = null;
        this.origin._subscribe(this);
        this.origin = null;
    },
    close: function () {
        if (this.scheduler) this.scheduler.close();
        if (this.source) this.source.close();
        this.scheduler = this.source = this.origin = null;
    },
    emit: function (value) {
        this.sink.emit(value);  
    },
    end: function (err) {
        this.source = null;
        this.sink.end(err);  
    },
    error: function (err) {
        this.scheduler.close();
        this.source.close();
        this.scheduler = this.source = this.origin = null;
        this.sink.end(err);
    }
};