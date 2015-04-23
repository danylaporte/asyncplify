Asyncplify.prototype.count = function (cond) {
    return new Asyncplify(Count, cond || condTrue, this)
}

function Count(cond, on, source) {
    this.cond = cond;
    this.value = 0;
    this.on = on;
    this.source = null;
    source._subscribe(this);
}

Count.prototype = {
    emit: function (value) {
        this.cond() && this.value++;
    },
    end: function (err) {
        !err && this.on.emit(this.value);
        this.on.end(err);
    },
    setState: setStateThru
}
