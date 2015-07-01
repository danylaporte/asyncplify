Asyncplify.fromNode = function (func) {
    var args = [];

    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    return new Asyncplify(FromNode, [func, args]);
};

function FromNode(options, sink) {
    this.called = false;
    this.sink = sink;
    this.sink.source = this;
    
    var self = this;
    
    function callback(err, value) {
        if (!self.called) {
            self.called = true;
            
            if (self.sink && !err)
                self.sink.emit(value);
                
            if (self.sink)
                self.sink.end(err);
                
            self.sink = null;
        }
    }
    
    try {
        options[0].apply(null, options[1].concat([callback]));
    } catch (ex) {
        this.called = true;
        
        if (this.sink)
            this.sink.end(ex);
        
        this.sink = null;
    }
}

FromNode.prototype.close = closeSink;