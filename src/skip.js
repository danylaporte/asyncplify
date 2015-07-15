Asyncplify.prototype.skip = function (count) {
    return typeof count !== 'number' || count <= 0 ? this : new Asyncplify(Skip, count, this);
};

function Skip(count, sink, source) {
    this.count = count;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

Skip.prototype = {
    emit: function (value) {
        if (this.count > 0)
            this.count--
        else
            this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};