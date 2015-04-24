Asyncplify.prototype.skipLast = function (count) {
    return new Asyncplify(SkipLast, typeof count === 'number' ? count : 1, this);
}

function SkipLast(count, on, source) {
    this.count = count;
    this.on = on;
    this.source = null;
    this.items = [];

    on.source = this;
    source._subscribe(this);
}

SkipLast.prototype = {
    emit: function (value) {
        this.items.push(value);
        this.items.length > this.count && this.on.emit(this.items.splice(0, 1)[0]);
    },
    end: endThru,
    setState: setStateThru
}
