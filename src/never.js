Asyncplify.never = function () {
    return new Asyncplify(Never)
}

function Never(_, sink) {
    sink.source = this;
}

Never.prototype.close = noop;
