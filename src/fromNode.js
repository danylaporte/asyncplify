Asyncplify.fromNode = function (func) {
    var args = [];

    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    return new Asyncplify(FromNode, [func, args]);
};

function FromNode(options, on) {
    this.error = null;
    this.hasValue = false;
    this.on = on;
    this.state = RUNNING;
    this.value = null;

    on.source = this;
    
    var self = this;
    
    function callback(err, value) {
        if (self.state === RUNNING) {
            self.state = CLOSED;
            
        if (!err) self.on.emit(value);
            self.on.end(err);
        } else {
            self.hasValue = true;
            self.value = value;
            self.error = err;
        }
    }
    
    options[0].apply(options.self, options[1].concat([callback]));
}

FromNode.prototype = {
    do: function () {
        if (this.hasValue) {
            this.state = CLOSED;
            if (!this.error) this.on.emit(this.value);
            this.on.end(this.error);
        }
    },
    setState: setState
};
