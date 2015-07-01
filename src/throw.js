Asyncplify.throw = function (err, cb) {
    return new Asyncplify(Throw, err);
};

function Throw(err, sink) {
    sink.end(err);
}

Throw.prototype.close = noop;