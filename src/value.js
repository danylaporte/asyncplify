Asyncplify.value = function (value) {
    return new Asyncplify(Value, value);
};

function Value(value, on) {
    on.source = this;
    try {
        on.emit(value);
    } catch (ex) {
        on.end(ex);
        return;
    }
    on.end(null);
}

Value.prototype.setState = noop;