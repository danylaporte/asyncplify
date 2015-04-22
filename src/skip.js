Robinet.prototype.skip = function (count) {
    return typeof count !== 'number' || count <= 0
        ? this
        : new Robinet(Skip, count, this)
}

function Skip(count, on, source) {
    this.count = count;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Skip.prototype = {
    emit: function (value) {
        if (this.count > 0) {
            this.count--
        } else {
            this.on.emit(value);
        }
    },
    end: endThru,
    setState: setStateThru
}
