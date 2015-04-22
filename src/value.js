Robinet.value = function (value, cb) {
    return new Robinet(Value, value);
};

function Value(value, on) {
    this.on = on;
    this.state = RUNNING;

    on.source = this;
    on.emit(value);

    this.state === RUNNING && this.do();
}

Value.prototype = {
    do: function () {
        this.state = CLOSED;
        this.on.end(null);
    },
    setState: setState
};
