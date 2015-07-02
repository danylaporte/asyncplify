function closeSchedulerContext() {
    var schedulerContext = this.schedulerContext;
    if (schedulerContext) {
        this.schedulerContext = null;
        schedulerContext.close();
    }    
}

function closeSource() {
    var source = this.source;
    if (source) {
        this.source = null;
        source.close();
    }
}

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
function endSink(err) {
    var sink = this.sink;
    if (sink) {
        this.sink = null;
        sink.end(err);
    }
}

function endThru() {
    throw new Error('Deprecated');
}

function endSinkSource(err) {
    this.source = null;
    this.endSink(err);
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