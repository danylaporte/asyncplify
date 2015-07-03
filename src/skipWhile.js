Asyncplify.prototype.skipWhile = function (cond) {
    return new Asyncplify(SkipWhile, cond, this);
};

function SkipWhile(cond, sink, source) {
    this.can = false;
    this.cond = cond;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

SkipWhile.prototype = {
    close: function () {
        this.cond = condTrue;
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (value) {
        if (this.can || !this.cond(value)) {
            this.can = true;
            this.sink.emit(value);
        }
    },
    end: function (err) {
        this.cond = condTrue;
        this.source = null;        
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(err);
    }
};