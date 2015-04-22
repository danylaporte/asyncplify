Robinet.range = function (options) {
    return new Robinet(Range, options);
}

function Range(options, on) {
    this.i = options && options.start || 0;
    this.end = typeof options === 'number' ? options : options && options.end || 0;
    this.step = options && options.step || 1;
    this.state = RUNNING;
    this.on = on;

    on.source = this;
    this.do();
}

Range.prototype = {
    do: function () {
        for (; this.i < this.end && this.state === RUNNING; this.i += this.step) {
            this.on.emit(this.i);
        }

        if (this.state === RUNNING) {
            this.state = CLOSED;
            this.on.end(null);
        }
    },
    setState: setState
}
