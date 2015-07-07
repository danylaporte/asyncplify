Asyncplify.prototype.takeWhile = function (cond) {
    return new Asyncplify(TakeWhile, cond, this);
};

function TakeWhile(cond, sink, source) {
    this.cond = cond;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

TakeWhile.prototype = {
    close: function () {
        if (this.source) this.source.close();
        this.cond = noop;
        this.source = null;
        this.sink = NoopSink.instance;
    },
    emit: function (value) {
        if (this.cond(value)) {
            this.sink.emit(value);
        } else {
            this.source.close();
            this.source = null;
            this.cond = noop;
            this.sink.end(null);
        }
    },
    end: function (err) {
        this.source = null;
        this.cond = noop;
        this.sink.end(err);
    }
};