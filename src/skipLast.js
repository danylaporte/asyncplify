Asyncplify.prototype.skipLast = function (count) {
    return new Asyncplify(SkipLast, typeof count === 'number' ? count : 1, this);
};

function SkipLast(count, sink, source) {
    this.count = count;
    this.items = [];
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

SkipLast.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.items.length = 0;
        this.source = null;  
    },
    emit: function (value) {
        this.source = null;
        this.items.push(value);
        this.items.length > this.count && this.sink.emit(this.items.splice(0, 1)[0]);
    },
    end: function (err) {
        this.source = null;
        this.items.length = 0;
        
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(err);
    }
};