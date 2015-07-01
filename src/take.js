Asyncplify.prototype.take = function (count) {
    return new Asyncplify(count ? Take : Empty, count, this);
};

function Take(count, sink, source) {
    this.count = count;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    
    source._subscribe(this);
}

Take.prototype = {
    close: closeSinkSource,
    emit: function (value) {
        if (this.count-- && this.sink) {
            this.sink.emit(value);
            
            if (!this.count) {
                var source = this.source;
                var sink = this.sink;
                
                this.source = null;
                this.sink = null;
                
                if (source)
                    source.close();
                    
                if (sink)
                    sink.end(null);
            }
        }
    },
    end: endSinkSource
};