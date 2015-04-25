Asyncplify.prototype.take = function (options) {
    return new Asyncplify(Take, options, this)
}

function Take(options, on, source) {
    this.cond = condTrue;
    this.count = -1;
    this.on = on;
    this.source = null;

    setCountAndCond(this, options);

    if (!this.count) {
        this.on.end(null);
    } else {
        on.source = this;
        source._subscribe(this);
    }
}

Take.prototype = {
    emit: function (value) {
        if (this.cond(value)) {
            if (!--this.count) {
                this.source.setState(CLOSED);
                this.on.emit(value);
                this.on.end(null);
            } else {
                this.on.emit(value);
            }
        }
    },
    end: endThru,
    setState: setStateThru
}
