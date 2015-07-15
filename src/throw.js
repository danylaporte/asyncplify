Asyncplify.throw = function (err, cb) {
    return new Asyncplify(Throw, err);
};

function Throw(err, sink) {
    sink.end(err);
    sink.source = this;
}

Throw.prototype.setState = noop;