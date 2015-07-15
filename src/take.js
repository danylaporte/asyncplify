Asyncplify.prototype.take = function (count) {
    return new Asyncplify(count > 0 ? Take : Empty, count, this);
};

function Take(count, sink, source) {
    this.count = count;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    
    source._subscribe(this);
}

Take.prototype = {
    emit: function (value) {
        if (this.count--) {
            this.sink.emit(value);
            
            if (!this.count) {
                this.source.setState(Asyncplify.states.CLOSED);
                this.source = null;
                this.sink.end(null);
            }
        }
    },
    end: function (err) {
        this.source = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};