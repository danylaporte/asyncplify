function FlatMapItem(parent) {
    this.parent = parent;
    this.source = null;
}

FlatMapItem.prototype = {
    emit: function (v) {
        this.parent.sink.emit(v);
    },
    end: function (err) {
        this.parent.childEnd(err, this);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};