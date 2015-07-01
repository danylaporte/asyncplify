function closeSink() {
    this.sink = null;
}

function closeSinkSource() {
    this.sink = null;

    if (this.source) {
        this.source.close();
        this.source = null;
    }
}

function condTrue() {
    return true;
}

function condFalse() {
    return false;
}

function emitThru(value) {
    if (this.sink)
        this.sink.emit(value);
}

function endThru() {
    throw new Error('Deprecated');
}

function endSinkSource(err) {
    if (this.source) {
        this.source = null;
        this.sink.end(err);
        this.sink = null;
    }
}

function identity(v) {
    return v;
}

function noop() {
}

function removeItem(items, item) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] === item) {
            items.splice(i, 1);
            break;
        }
    }
}

function setCountAndCond(self, options) {
    switch (typeof options) {

        case 'number':
            self.count = options;
            break;

        case 'function':
            self.cond = options;
            break;

        default:
            if (options) {
                if (typeof options.count === 'number') self.count = options.count;
                self.cond = options.cond || condTrue;
            }
            break;
    }
}

function setState(state) {
    if (this.state !== CLOSED && this.state !== state) {
        this.state = state;
        this.state === RUNNING && this.do();
    }
}

function setStateThru(state) {
    this.source.setState(state);
}
