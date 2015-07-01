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
    close: closeSinkSource,
    emit: noop,
    end: endSinkSource
};