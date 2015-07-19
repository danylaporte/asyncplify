Asyncplify.prototype.share = function (scheduler) {
    var r = new Asyncplify(Share, null, this);
    r.emit = shareEmit;
    r.end = shareEnd;
    r.source = null;
    r._refs = [];
    r._scheduler = null;
    r._schedulerFactory = scheduler || schedulers.immediate;
    return r;
};

function shareEmit(value) {
    for (var i = 0; i < this._refs.length; i++)
        this._refs[i].emit(value);
}

function shareEnd(err) {
    var array = this._refs;

    this.source = null;
    this._refs = [];

    for (var i = 0; i < array.length; i++)
        array[i].end(err);
}

function Share(_, sink, source, parent) {
    this.parent = parent;
    this.sink = sink;
    this.sink.source = this;
    this.state = Asyncplify.states.RUNNING;

    parent._refs.push(this);

    if (parent._refs.length === 1) {
        this.parent._scheduler = this.parent._schedulerFactory();

        parent._scheduler.schedule({
            action: function () {
                source._subscribe(parent);
            },
            error: function (err) {
                parent.end(err);
            }
        });
    }
}

Share.prototype = {
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        this.state = Asyncplify.states.CLOSED;
        this.parent = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
            this.state = state;

            switch (state) {
                case Asyncplify.states.RUNNING:
                    for (var i = 0; i < this.parent._refs.length; i++)
                        if (this.parent._refs[i].state !== Asyncplify.states.RUNNING) return;
                    break;

                case Asyncplify.states.CLOSED:
                    removeItem(this.parent._refs, this);
                    if (this.parent._refs.length) return;
                    break;
            }

            if (this.parent._scheduler) this.parent._scheduler.setState(state);
            if (this.parent.source) this.parent.source.setState(state);
        }
    }
};