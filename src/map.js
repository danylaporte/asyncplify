Asyncplify.prototype.map = function (mapper) {
    return mapper ? new Asyncplify(Map, mapper, this) : this;
}

function Map(mapper, on, source) {
    this.mapper = mapper;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Map.prototype = {
    emit: function (value) {
        this.on.emit(this.mapper(value));
    },
    end: endThru,
    setState: setStateThru
}
