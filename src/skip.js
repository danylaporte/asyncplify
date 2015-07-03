Asyncplify.prototype.skip = function (count) {
    return typeof count !== 'number' || count <= 0 ? this : new Asyncplify(Skip, count, this);
};

function Skip(count, sink, source) {
    this.count = count;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

Skip.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;  
    },
    emit: function (value) {
        if (this.count > 0) {
            this.count--
        } else {
            this.sink.emit(value);
        }
    },
    end: function (err) {
        this.source = null;
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(err);      
    }
};