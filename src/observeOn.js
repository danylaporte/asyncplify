Asyncplify.prototype.observeOn = function (options) {
    return new Asyncplify(ObserveOn, options, this);
};

function ObserveOn(options, sink, source) {
    this.scheduler = (typeof options === 'function' ? options : (options && options.scheduler || schedulers.immediate))();
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

ObserveOn.prototype = {
    emit: function (v) {
        this.scheduler.schedule(new ObserveOnItem(v, true, this));
    },
    end: function (err) {
        this.scheduler.schedule(new ObserveOnItem(err, false, this));
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
        if (this.scheduler) this.scheduler.setState(state);
    }
};

function ObserveOnItem(value, isEmit, parent) {
    this.isEmit = isEmit;
    this.parent = parent;
    this.value = value;
}

ObserveOnItem.prototype = {
    action: function () {
        this.isEmit ? this.parent.sink.emit(this.value) : this.parent.sink.end(this.value);
    },
    error: function (err) {
        this.parent.sink.end(err);
        this.parent.setState(Asyncplify.states.CLOSED);
    },
    delay: 0
};