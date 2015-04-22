Robinet.prototype.skipWhile = function (cond) {
    return new Robinet(SkipWhile, cond, this);
}

function SkipWhile(cond, on, source) {
    this.can = false;
    this.cond = cond;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

SkipWhile.prototype = {
    emit: function (value) {
        if (this.can || !this.cond(value)) {
            this.can = true;
            this.on.emit(value);
        }
    },
    end: endThru,
    setState: setStateThru
}
