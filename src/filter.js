Asyncplify.prototype.filter = function (cond) {
    if (typeof cond === 'function')
        return new Asyncplify(Filter, cond, this);

    if (cond === false)
        return new Asyncplify(Filter, condFalse, this);

    return this;
}

function Filter(cond, sink, source) {
    this.cond = cond;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

Filter.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (value) {
        if (this.cond(value))
            this.sink.emit(value);
    },
    end: function (err) {
        this.sink.end(err);
    }
};