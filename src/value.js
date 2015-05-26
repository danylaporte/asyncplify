Asyncplify.value = function (value) {
    return new Asyncplify(Value, value);
};

function Value(value, on) {
    on.source = this;
    on.emit(value);
    on.end(null);
}

Value.prototype.setState = noop;