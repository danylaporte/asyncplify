function condTrue() {
    return true;
}

function condFalse() {
    return false;
}

function identity(v) {
    return v;
}

function noop() {
}

function NoopSink() { }

NoopSink.prototype = {
    close: noop,
    emit: noop,
    end: noop
};

NoopSink.instance = new NoopSink();

function removeItem(items, item) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] === item) {
            items.splice(i, 1);
            break;
        }
    }
}