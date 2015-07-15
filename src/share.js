Asyncplify.prototype.share = function (options) {
    var r = new Asyncplify(Share, null, this);
    r.emit = shareEmit;
    r.end = shareEnd;
    r._scheduler = options && options.scheduler && options.scheduler() || schedulers.sync();
    r._refs = [];
    return r;
};

function shareEmit(value) {
    for (var i = 0; i < this._refs.length; i++)
        this._refs[i].emit(value);
}

function shareEnd(err) {
    var array = this._refs;
    this._refs = [];

    for (var i = 0; i < array.length; i++)
        array[i].end(err);
}

function Share(_, sink, source, parent) {
    this.parent = parent;
    this.sink = sink;
    this.sink.source = this;

    parent._refs.push(this);

    var self = this;

    if (parent._refs.length === 1) {
        parent._scheduler.schedule({
            action: function () {
                source._subscribe(parent);
            },
            error: function (err) {
                self.sink.end(err);
            }
        });
    }
}

Share.prototype = {
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        this.parent.source = null;
        this.parent = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.parent) {
            if (state === Asyncplify.states.CLOSED) {
                removeItem(this.parent._refs, this);

                if (!this.parent._refs.length) {
                    this.parent._scheduler.setState(state);
                    if (this.parent.source) this.parent.source.setState(state);
                    this.parent.source = null;
                }

                this.parent = null;
            } else if (this.parent.source) {
                this.parent.source.setState(state);
            }
        }
    }
};