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
        this.scheduler.setState(Asyncplify.states.CLOSED);
        this.scheduler = null;
        this.origin._subscribe(this);
        this.origin = null;
    },
    emit: function (value) {
        this.sink.emit(value);  
    },
    end: function (err) {
        this.source = null;
        this.sink.end(err);  
    },
    error: function (err) {
        if (this.scheduler) this.scheduler.setState(Asyncplify.states.CLOSED);
        if (this.source) this.source.setState(Asyncplify.states.CLOSED);
        this.scheduler = this.source = this.origin = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.scheduler) this.scheduler.setState(state);
        if (this.source) this.source.setState(state);
    }
};