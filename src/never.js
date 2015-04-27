Asyncplify.never = function () {
    return new Asyncplify(Never)
}

function Never(_, on) {
    on.source = this;
}

Never.prototype.setState = noop;
