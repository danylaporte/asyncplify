Asyncplify.prototype.count = function (cond) {
    return new Asyncplify(Count, cond, this);
};

function Count(cond, sink, source) {
    this.cond = cond || condTrue;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.value = 0;

    source._subscribe(this);
}

Count.prototype = {
    emit: function (value) {
        if (this.cond(value)) this.value++;
    },
    end: function (err) {
        this.source = null;
        if (!err) this.sink.emit(this.value);
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};