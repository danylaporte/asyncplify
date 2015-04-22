function Robinet(func, arg, source) {
    this._arg = arg;
    this._func = func;
    this._src = source;
}

Robinet.prototype._subscribe = function (observer) {
    new this._func(this._arg, observer, this._src, this);
}
