Asyncplify.range = function (options) {
    return new Asyncplify(Range, options);
};

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
        try {
            this.doEmit();
        } catch (ex) {
            this.doEnd(ex);
            return;
        }
        this.doEnd(null);
    },
    doEmit: function () {
        while (this.i < this.end && this.state === RUNNING) {
            var v = this.i;
            this.i += this.step;
            this.on.emit(v);
        }
    },
    doEnd: function (error) {
        if (this.state === RUNNING) {
            this.state = CLOSED;
            this.on.end(error);
        }
    },
    setState: setState
};