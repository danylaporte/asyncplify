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
        if (this.source) {
            this.source.close();
            this.source = null;
            this.registerProcessEnd(false);
            this.action();
        }
        
        this.sink = null;
    },
    emit: function (value) {
        if (this.sink)
            this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;
        this.registerProcessEnd(false);
        this.action();
        
        if (this.sink)
            this.sink.end(err);
            
        this.sink = null;
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