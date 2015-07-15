function Asyncplify(func, arg, source) {
    this._arg = arg;
    this._func = func;
    this._src = source;
}

Asyncplify.prototype._subscribe = function (observer) {
    new this._func(this._arg, observer, this._src, this);
};

Asyncplify.states = {
    RUNNING: 0,
    PAUSED: 1,
    CLOSED: 2
};