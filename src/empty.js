Asyncplify.empty = function () {
    return new Asyncplify(Empty);
};

function Empty(_, sink) {
    sink.source = this;
    sink.end(null);
}

Empty.prototype.setState = noop;