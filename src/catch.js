Asyncplify.prototype.catch = function(options) {
    return new Asyncplify(Catch, options, this);
};

function Catch(options, sink, source) {
    this.i = 0;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.sources = null;
    
    if (typeof options === 'function')
        this.mapper = options;
    else
        this.sources = Array.isArray(options) ? options : [];
    
    source._subscribe(this);
}
        
Catch.prototype = {
    close: function () {
        this.mapper = noop;
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function(err) {
        this.source = null;
        
        if (err) {
            var source = this.mapper(err);
            
            if (source && this.sink)
                return source._subscribe(this);
        }
        
        this.sink.end(err);
        this.sink = NoopSink.instance;
    },
    mapper: function() {
        return this.i < this.sources.length && this.sources[this.i++];
    }
};