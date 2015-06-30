Asyncplify.range = function (options) {
    return new Asyncplify(RangeOp, options);
};

function RangeOp(options, sink) {
    var i = options && options.start || 0;
    var end = typeof options === 'number' ? options : options && options.end || 0;
    var step = options && options.step || 1;
    
    this.sink = sink;
    this.sink.source = this;
    
    for (; i < end && this.sink; i += step)
        this.sink.emit(i);
        
    if (this.sink) this.sink.end(null);
}

RangeOp.prototype.close = function () {
    this.sink = null;  
};