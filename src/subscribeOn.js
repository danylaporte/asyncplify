Asyncplify.prototype.subscribeOn = function (options) {
    return new Asyncplify(SubscribeOn, options, this);
};

function SubscribeOn(options, sink, source) {
    this.origin = source;
    this.sink = sink;
    this.sink.source = this;
    this.schedulerContext = (typeof options === 'function' ? options : (options && options.scheduler || schedulers.immediate))();
    this.source = null;

    this.schedulerContext.schedule(this);
}

SubscribeOn.prototype = {
    action: function () {
        this.closeSchedulerContext();
        this.origin._subscribe(this);
    },
    close: function () {
        this.closeSchedulerContext();
        this.closeSource();
        this.sink = null;
    },
    closeSchedulerContext: closeSchedulerContext,
    closeSource: closeSource,
    emit: emitThru,
    end: endSinkSource,
    endSink: endSink,
    error: function (err) {
        this.closeSchedulerContext();
        this.closeSource();
        this.endSink(err);
    }
};