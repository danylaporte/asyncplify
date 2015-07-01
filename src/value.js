Asyncplify.value = function (value) {
    return new Asyncplify(Value, value);
};

function Value(value, sink) {
    this.sink = sink;
    this.sink.source = this;
    this.sink.emit(value);
    if (this.sink) this.sink.end(null);
}

Value.prototype.close = closeSink;