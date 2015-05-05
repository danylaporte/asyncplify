Asyncplify.prototype.ignoreElements = function () {
    return new Asyncplify(IgnoreElements, null, this)
}

function IgnoreElements(_, on, source) {
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

IgnoreElements.prototype = {
    emit: noop,
    end: endThru,
    setState: setStateThru
}