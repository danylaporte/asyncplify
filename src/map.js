Asyncplify.prototype.map = function (mapper) {
    return mapper ? new Asyncplify(Map, mapper, this) : this;
};

function Map(mapper, sink, source) {
    this.mapper = mapper;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

Map.prototype = {
    emit: function (value) {
        this.sink.emit(this.mapper(value));
    },
    end: function (err) {
        this.mapper = noop;
        this.source = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};