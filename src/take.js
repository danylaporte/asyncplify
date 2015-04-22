Robinet.prototype.take = function (count) {
    return typeof count !== 'number'
        ? this
        : count <= 0
        ? Robinet.empty()
        : new Robinet(Take, count, this)
}

function Take(count, on, source) {
    this.count = count;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Take.prototype = {
    emit: function (value) {
        if (!--this.count) {
            this.source.setState(CLOSED);
            this.on.emit(value);
            this.on.end(null);
        } else {
            this.on.emit(value);
        }
    },
    end: endThru,
    setState: setStateThru
}
