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
    emit: function (value) {
        if (this.cond(value)) {
            this.sink.emit(value);
        } else {
            this.source.setState(Asyncplify.states.CLOSED);
            this.source = null;
            this.cond = noop;
            this.sink.end(null);
        }
    },
    end: function (err) {
        this.source = null;
        this.cond = noop;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};