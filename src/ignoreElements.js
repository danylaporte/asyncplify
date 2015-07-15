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
    emit: noop,
    end: function (err) {
        this.source = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};