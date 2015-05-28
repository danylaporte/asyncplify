Asyncplify.prototype.toArray = function (options, source, cb) {
    return new Asyncplify(ToArray, options || {}, this);
};

function ToArray(options, on, source) {
    this.array = [];
    this.emitEmpty = options.emitEmpty || false;
    this.on = on;
    this.splitCond = null;
    this.splitLength = 0;
    this.trigger = null;
    this.hasEmit = false;
    this.source = null;

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

    on.source = this;
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
    emit: function (value) {
        this.array.push(value);
    },
    emitArray: function () {
        var a = this.array;
        this.array = [];
        this.hasEmit = true;
        this.on.emit(a);
    },
    end: function (err) {
        !err && (this.array.length || (!this.hasEmit && this.emitEmpty)) && this.on.emit(this.array);

        if (this.trigger) {
            this.trigger.setState(CLOSED);
            this.trigger = null;
        }

        this.on.end(err);
    },
    setState: function (state) {
        this.source.setState(state);
        this.trigger && this.trigger.setState(state);
    },
    triggerEmit: function () {
        (this.array.length || this.emitEmpty) && this.emitArray();
    }
};