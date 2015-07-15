Asyncplify.fromNode = function (func) {
    var args = [];

    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    return new Asyncplify(FromNode, [func, args]);
};

function FromNode(options, sink) {
    this.sink = sink;
    this.sink.source = this;
    
    var self = this;
    
    function callback(err, value) {
        self.sink.emit(value);
        self.sink.end(err);
    }
    
    try {
        options[0].apply(null, options[1].concat([callback]));
    } catch (ex) {
        this.sink.end(ex);
    }
}

FromNode.prototype.setState = function (state) {
    if (state === Asyncplify.states.CLOSED)
        this.sink = NoopSink.instance;
};