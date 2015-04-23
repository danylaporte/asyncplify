Asyncplify.prototype.flatMap = function(mapper) {
    return new Asyncplify(FlatMap, mapper, this)
}

function FlatMap(mapper, on, source) {
    this.items = [];
    this.mapper = mapper;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

FlatMap.prototype = {
    childEnd: function (err, item) {
        removeItem(this.items, item);
        err && this.setState(CLOSED);
        (err || (!this.items.length && !this.source)) && this.on.end(err);
    },
    emit: function (v) {
        var item = this.mapper(v);
        item && new FlatMapItem(this, item);
    },
    end: function (err) {
        this.source = null;
        err && this.setState(CLOSED);
        (err || !this.items.length) && this.on.end(err);
    },
    setState: function (state) {
        this.source && this.source.setState(state);

        for (var i = 0; i < this.items.length; i++) {
            this.items[i].setState(state);
        }
    }
}

function FlatMapItem(on, source) {
    this.on = on;
    this.source = null;

    on.items.push(this);
    source._subscribe(this);
}

FlatMapItem.prototype = {
    emit: function (v) {
        this.on.on.emit(v);
    },
    end: function (err) {
        this.on.childEnd(err, this);
    },
    setState: setStateThru
}
