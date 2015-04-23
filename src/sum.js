Asyncplify.prototype.sum = function (mapper, source, cb) {
    return new Asyncplify(Sum, mapper || identity, this)
}

function Sum(mapper, on, source) {
    this.hasValue = false;
    this.mapper = mapper;
    this.value = 0;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Sum.prototype = {
    emit: function (value) {
        this.value += this.mapper(value) || 0;
        this.hasValue = true;
    },
    end: function (err) {
        !err && this.hasValue && this.on.emit(this.value);
        this.on.end(err);
    },
    setState: setStateThru
}
