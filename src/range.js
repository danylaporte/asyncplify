Asyncplify.range = function (options) {
    return new Asyncplify(RangeOp, options);
};

function RangeOp(options, sink) {
    this.end = typeof options === 'number' ? options : options && options.end || 0;
    this.i = options && options.start || 0; 
    this.sink = sink;
    this.sink.source = this;
    this.state = Asyncplify.states.RUNNING;
    this.step = options && options.step || 1;
    
    this.emitValues();
}

RangeOp.prototype = {
    emitValues: function () {
        while (this.i < this.end && this.state === Asyncplify.states.RUNNING) {
            var j = this.i;
            this.i += this.step;
            this.sink.emit(j);
        }
            
        if (this.state === Asyncplify.states.RUNNING) {
            this.state = Asyncplify.states.CLOSED;
            this.sink.end(null);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
            this.state = state;
            if (state === Asyncplify.states.RUNNING) this.emitValues();
        }
    }
};