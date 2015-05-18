function FlatMapItem(on) {
    this.on = on;
    this.source = null;
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