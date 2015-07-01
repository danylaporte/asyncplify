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
    close: closeSinkSource,
    emit: function (value) {
        if (this.sink && this.cond(value))
            this.value++;
    },
    end: function (err) {
        this.source = null;

        if (this.sink && !err)
            this.sink.emit(this.value);

        if (this.sink)
            this.sink.end(err);

        this.sink = null;
    }
};