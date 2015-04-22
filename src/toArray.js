Robinet.prototype.toArray = function (options, source, cb) {
    return new Robinet(ToArray, options || EMPTYOBJ, this)
}

function ToArray(options, on, source) {
    this.array = [];
    this.emitEmpty = options.emitEmpty || false;
    this.on = on;
    this.splitCond = null;
    this.splitLength = 0;
    this.trigger = null;
    this.hasEmit = false;
    this.source = null;

    if (options.split) {
        if (typeof options.split === 'number') {
            if (options.split > 0) {
                this.splitLength = options.split;
                this.emit = toArraySplitLength;
            }
        } else if (typeof options.split === 'function') {
            this.splitCond = options.split;
            this.emit = toArraySplitCond;
        } else if (options.split instanceof Robinet) {
            new Trigger(options.split, this);
        }
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
}
