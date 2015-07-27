function FlatMapItem(parent, debug) {
    this.debug = debug || noop;
    this.parent = parent;
    this.source = null;
}

FlatMapItem.prototype = {
    emit: function (v) {
        this.debug('flatMapItem emit %j', v);
        this.parent.sink.emit(v);
    },
    end: function (err) {
        err ? this.debug('flatMapItem error', err) : this.debug('flatMapItem end');
        this.parent.childEnd(err, this);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};