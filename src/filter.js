Robinet.prototype.filter = function (cond) {
    if (typeof cond === 'function')
        return new Robinet(Filter, cond, this);

    if (cond === false)
        return new Robinet(Filter, condFalse, this);

    return this;
}

function Filter(cond, on, source) {
    this.cond = cond;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Filter.prototype = {
    emit: function (value) {
        this.cond(value) && this.on.emit(value);
    },
    end: endThru,
    setState: setStateThru
}
