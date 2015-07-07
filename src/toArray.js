Asyncplify.prototype.toArray = function (options, source, cb) {
    return new Asyncplify(ToArray, options, this);
};

function ToArray(options, sink, source) {
    this.array = [];
    this.emitEmpty = options && options.emitEmpty || false;
    this.hasEmit = false;
    this.sink = sink;
    this.sink.source = this;
    this.splitCond = null;
    this.splitLength = 0;
    this.source = null;
    this.trigger = null;

    var split = options && options.split || options;

    switch (typeof split) {
        case 'number':
            this.splitLength = split;
            this.emit = toArraySplitLength;
            break;

        case 'function':
            this.splitCond = split;
            this.emit = toArraySplitCond;
            break;

        case 'object':
            if (split instanceof Asyncplify) new Trigger(split, this);
            break;
    }

    source._subscribe(this);
}

function toArraySplitCond(v) {
    (this.emitEmpty || this.array.length) && this.splitCond(v, this.array) && this.emitArray();
    this.array.push(v);
}

function toArraySplitLength(v) {
    this.array.push(v);
    this.splitLength && this.array.length >= this.splitLength && this.emitArray();
}

ToArray.prototype = {
    close: function () {
        this.sink = NoopSink.instance;
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (value) {
        this.array.push(value);
    },
    emitArray: function () {
        var a = this.array;
        this.array = [];
        this.hasEmit = true;
        this.sink.emit(a);
    },
    end: function (err) {
        this.source = null;
        
        if (!err && (this.array.length || (!this.hasEmit && this.emitEmpty)))
            this.sink.emit(this.array);

        if (this.trigger) this.trigger.close();
        this.trigger = null;
        this.sink.end(err);
    },
    triggerEmit: function () {
        if (this.array.length || this.emitEmpty) this.emitArray();
    }
};