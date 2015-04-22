Robinet.empty = function () {
    return new Robinet(Empty)
}

function Empty(_, on) {
    on.source = this;
    on.end(null);
}

Empty.prototype.setState = noop;
