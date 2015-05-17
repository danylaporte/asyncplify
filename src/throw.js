Asyncplify.throw = function (err, cb) {
    return new Asyncplify(Throw, err);
};

function Throw(err, on) {
    on.source = this;
    on.end(err);
}

Throw.prototype.setState = noop;