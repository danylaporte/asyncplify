Asyncplify.prototype.publishRefCount = function (options) {
    var r = new Asyncplify(PublishRefCount, null, this);
    r.emit = publishRefCountEmit;
    r.end = publishRefCountEnd;
    r.setState = setStateThru;
    r.refs = [];
    r._scheduler = options && options.scheduler && options.scheduler() || schedulers.sync();
    r._scheduler.itemDone = noop;
    return r;
}

function publishRefCountEmit(value) {
    for (var i = 0; i < this.refs.length; i++) {
        this.refs[i].emit(value);
    }
}

function publishRefCountEnd(err) {
    var array = this.refs;
    this.refs = [];

    for (var i = 0; i < array.length; i++) {
         array[i].end(err);
    }
}

function PublishRefCount(_, on, source, asyncplify) {
    this.on = on;
    this.source = asyncplify;

    on.source = this;
    asyncplify.refs.push(this);

    if (asyncplify.refs.length === 1) {
        asyncplify._scheduler.schedule({
            action: function () {
                source._subscribe(asyncplify);
            }
        });
    }
}

PublishRefCount.prototype = {
    emit: emitThru,
    end: endThru,
    setState: function (state) {
        this.source._scheduler.setState(state);
        var refs = this.source.refs;
        if (refs.length) {
            if (state === CLOSED) {
                removeItem(refs, this);
                !refs.length && this.source.setState(CLOSED);
            } else {
                this.source.setState(state);
            }
        }
    }
}
