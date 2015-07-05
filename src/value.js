Asyncplify.value = function (value) {
    return new Asyncplify(Value, value);
};

function Value(value, sink) {
    this.sink = sink;
    this.sink.source = this;
    this.sink.emit(value);
    this.sink.end(null);
}

Value.prototype.close = function () {
    this.sink = NoopSink.instance;
};