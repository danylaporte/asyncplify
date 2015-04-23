Asyncplify.empty = function () {
    return new Asyncplify(Empty)
}

function Empty(_, on) {
    on.source = this;
    on.end(null);
}

Empty.prototype.setState = noop;
