Asyncplify.prototype.defaultIfEmpty = function (value) {
    return new Asyncplify(DefaultIfEmpty, value, this);
};

function DefaultIfEmpty(value, sink, source) {
    this.hasValue = false;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.value = value;
    
    source._subscribe(this);
}

DefaultIfEmpty.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (value) {
        this.hasValue = true;
        if (this.sink) this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;

        if (!this.hasValue && !err)
            this.sink.emit(this.value);

        this.sink.end(err);
        this.sink = NoopSink.instance;
    }
};