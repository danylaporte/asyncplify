Asyncplify.prototype.takeWhile = function (cond) {
    return new Asyncplify(TakeWhile, cond, this);
};

function TakeWhile(cond, sink, source) {
    this.cond = cond;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

TakeWhile.prototype = {
    close: closeSinkSource,
    emit: function (value) {
        if (this.sink && this.cond(value) && this.sink)
            this.sink.emit(value);
            
        else if (this.sink) {
            var sink = this.sink;
            var source = this.source;
            
            this.sink = null;
            this.source = null;
            
            if (source)
                source.close();
                
            if (sink)
                sink.end(null);;
        }
    },
    end: endSinkSource
};