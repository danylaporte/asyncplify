Asyncplify.fromPromise = function (promise, cb) {
    return new Asyncplify(FromPromise, promise);
};

function FromPromise(promise, sink) {
    this.sink = sink;
    this.sink.source = this;

    var self = this;
    
    function resolve(v) {
        self.sink.emit(v);
        self.sink.end(null);
    }
    
    function rejected(err) {
        self.sink.end(err);
    }

    promise.then(resolve, rejected);
}

FromPromise.prototype.setState = function (state) {
    if (state === Asyncplify.states.CLOSED)
        this.sink = NoopSink.instance;  
};