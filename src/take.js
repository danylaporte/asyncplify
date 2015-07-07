Asyncplify.prototype.take = function (count) {
    return new Asyncplify(count > 0 ? Take : Empty, count, this);
};

function Take(count, sink, source) {
    this.count = count;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    
    source._subscribe(this);
}

Take.prototype = {
    close: function () {
        if (this.source) this.source.close();
        this.sink = NoopSink.instance;
        this.source = null;
    },
    emit: function (value) {
        if (this.count--) {
            this.sink.emit(value);
            
            if (!this.count) {
                this.source.close();
                this.source = null;
                this.sink.end(null);
            }
        }
    },
    end: function (err) {
        this.source = null;
        this.sink.end(err);
    }
};