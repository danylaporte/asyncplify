Asyncplify.value = function (value, cb) {
    return new Asyncplify(Value, value);
};

function Value(value, on) {
    on.source = this;
    on.emit(value);
    on.end(null);
}

Value.prototype.setState = noop;