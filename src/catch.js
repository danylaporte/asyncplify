Asyncplify.prototype.catch = function(options) {
    return new Asyncplify(Catch, options, this);
};

function Catch(options, sink, source) {
    this._i = 0;
    this._sink = sink;
    this._source = null;
    this._sources = null;
    if(options && options._mapper) this._mapper = options._mapper;
    else if(typeof options === 'function') this._mapper = options;
    else this._sources = options && options.sources || Array.isArray(options) ? options : [];
    sink._source = this;
    source._subscribe(this);
}
Catch.prototype = {
    cancel: function() {
        this._sink = null;
        if(this._source) this._source.cancel();
    },
    emit: function(value) {
        if(this._sink) this._sink.emit(value);
    },
    end: function(err) {
        this._source = null;
        if(err && this.sink) {
            var source = this._mapper(err, this._sink);
            if(source && this._sink) return source._subscribe(this);
        }
        if(this._sink) {
            this._sink.end(null);
            this._sink = null;
        }
    },
    _mapper: function() {
        return this._i < this._sources.length && this._sources[this._i++];
    }
};