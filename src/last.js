Asyncplify.prototype.last = function (cond) {
    return new Asyncplify(Last, cond, this);
};

function Last(cond, sink, source) {
    this.cond = cond || condTrue;
    this.hasItem = false;
    this.item = null;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    
    source._subscribe(this);
}

Last.prototype = {
    emit: function (value) {
        if (this.cond(value)) {
            this.item = value;
            this.hasItem = true;
        }
    },
    end: function (err) {
        this.source = null;
        
        if (!err && this.hasItem) this.sink.emit(this.item);
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};