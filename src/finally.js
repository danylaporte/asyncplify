Asyncplify.prototype.finally = function (action) {
    return action ? new Asyncplify(Finally, action, this) : this;
};

function Finally(action, on, source) {
    this.action = action;
    this.on = on;
    this.source = null;
    this.state = RUNNING;
    this.registerProcessEnd(true);

    on.source = this;
    source._subscribe(this);
}

Finally.prototype = {
    emit: emitThru,
    end: function (err) {
        if (this.state !== CLOSED) {
            this.state = CLOSED;
            this.registerProcessEnd(false);
            this.action();
            this.on.end(err);
        }
    },
    registerProcessEnd: function (register) {
        if (typeof process === 'object') {
            var func = process[register ? 'on' : 'removeListener'];
        
            func('SIGINT', this.action);
            func('SIGQUIT', this.action);
            func('SIGTERM', this.action);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;
            this.source.setState(state);
            
            if (this.state === state && state === CLOSED) {
                this.registerProcessEnd(false);
                this.action();
            }
        }
    }
};