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
            this.scheduler.setState(Asyncplify.states.CLOSED);
            this.sink.end(null);
        }
    },
    emit: function (value) {
        this.itemPending = true;
        this.value = value;
        this.scheduler.reset();
        this.scheduler.schedule(this);
    },
    end: function (err) {
        this.source = null;

        if (err || !this.itemPending) {
            this.scheduler.setState(Asyncplify.states.CLOSED);
            this.value = undefined;
            this.sink.end(err);
        }
    },
    setState: function (state) {
        this.scheduler.setState(state);
        if (this.source) this.source.setState(state);
    }
};