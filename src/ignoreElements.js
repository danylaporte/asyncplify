Asyncplify.prototype.ignoreElements = function () {
    return new Asyncplify(IgnoreElements, null, this);
};

function IgnoreElements(_, sink, source) {
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

IgnoreElements.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: noop,
    end: function (err) {
        this.source = null;
        this.sink.end(err);
        this.sink = NoopSink.instance;
    }
};