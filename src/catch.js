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
    close: function() {
        this.sink = null;
        
        if (this.source) {
            this.source.close();
            this.source = null;
        }
    },
    emit: function(value) {
        if (this.sink)
            this.sink.emit(value);
    },
    end: function(err) {
        this.source = null;
        
        if (err && this.sink) {
            var source = this.mapper(err);
            
            if (source && this.sink)
                return source._subscribe(this);
        }
        
        if (this.sink) {
            this.sink.end(err);
            this.sink = null;
        }
    },
    mapper: function() {
        return this.i < this.sources.length && this.sources[this.i++];
    }
};