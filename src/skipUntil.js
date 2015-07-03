Asyncplify.prototype.skipUntil = function (trigger) {
    return new Asyncplify(SkipUntil, trigger, this);
};

function SkipUntil(trigger, sink, source) {
    this.can = false;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.trigger = null;

    new Trigger(trigger, this);
    source._subscribe(this);
}

SkipUntil.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.trigger) this.trigger.close();
        if (this.source) this.source.close();
        this.trigger = this.source = null;  
    },
    emit: function (value) {
        if (this.can) this.sink.emit(value);
    },
    end: function (err) {
        if (this.trigger) this.trigger.close();
        this.trigger = this.source = null;
        
        var sink = this.sink;
        this.sink = null;
        sink.end(err);
    },
    triggerEmit: function () {
        this.trigger.close();
        this.trigger = null;
        this.can = true;
    }
};