Asyncplify.prototype.finally = function (action) {
    return action ? new Asyncplify(Finally, action, this) : this;
};

function Finally(action, sink, source) {
    this.action = action;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    
    this.registerProcessEnd(true);
    source._subscribe(this);
}

Finally.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        
        if (this.source) {
            this.source.close();
            this.source = null;
            this.registerProcessEnd(false);
            this.action();
        }
    },
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;
        this.registerProcessEnd(false);
        this.action();
        this.sink.end(err);
    },
    registerProcessEnd: function (register) {
        if (typeof process === 'object') {
            var n = register ? 'on' : 'removeListener';
            process[n]('SIGINT', this.action);
            process[n]('SIGQUIT', this.action);
            process[n]('SIGTERM', this.action);
        }
    }
};