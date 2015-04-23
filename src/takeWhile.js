Asyncplify.prototype.takeWhile = function (cond) {
    return new Asyncplify(TakeWhile, cond, this);
}

function TakeWhile(cond, on, source) {
    this.cond = cond;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

TakeWhile.prototype = {
    emit: function (value) {
        if (this.cond(value)) {
            this.on.emit(value);
        } else {
            this.source.setState(CLOSED);
            this.on.end(null);
        }
    },
    end: endThru,
    setState: setStateThru
}
