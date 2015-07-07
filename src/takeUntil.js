Asyncplify.prototype.takeUntil = function (trigger) {
    return new Asyncplify(TakeUntil, trigger, this);
};

function TakeUntil(trigger, sink, source) {
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.trigger = null;

    new Trigger(trigger, this);
    
    if (this.trigger) source._subscribe(this);
}

TakeUntil.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        if (this.trigger) this.trigger.close();
        this.source = this.trigger = null;  
    },
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        if (this.trigger) this.trigger.close();
        this.source = this.trigger = null;
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(err);
    },
    triggerEmit: function () {
        if (this.source) this.source.close();
        this.trigger.close();
        this.source = this.trigger = null;
        
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(null);
    }
};