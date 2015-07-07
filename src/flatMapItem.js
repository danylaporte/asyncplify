function FlatMapItem(parent) {
    this.parent = parent;
    this.source = null;
}

FlatMapItem.prototype = {
    close: function () {
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (v) {
        this.parent.sink.emit(v);
    },
    end: function (err) {
        this.parent.childEnd(err, this);
    }
};