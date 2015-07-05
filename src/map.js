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
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.mapper = noop;
        this.source = null;  
    },
    emit: function (value) {
        this.sink.emit(this.mapper(value));
    },
    end: function (err) {
        this.mapper = noop;
        this.source = null;
        
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(err);
    }
};