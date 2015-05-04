Asyncplify.merge = function (options) {
    return new Asyncplify(Merge, options)
}

function Merge(options, on) {
    var items = options.items || options;
    var maxConcurrency = options.maxConcurrency || 0;

    this.on = on;
    this.subscriptions = [];
    on.source = this;

    if (!Array.isArray(items)) {
        throw Error('items are not an array');
    }

    this.iterator = new ArrayIterator(items);

    var next;
    var i = 0;
    var found = false;

    while ((i++ < maxConcurrency || maxConcurrency === 0) && !(next = this.iterator.next()).done) {
        found = true;
        new MergeItem(next.value, this);
    }

    !found && on.end(null);
}

Merge.prototype = {
    setState: function (state) {
        for (var i = 0; i < this.subscriptions.length; i++) {
            this.subscriptions[i].setState(state);
        }
    }
}

function MergeItem(item, on) {
    this.on = on;
    this.source = null;

    on.subscriptions.push(this);
    item._subscribe(this);
}

MergeItem.prototype = {
    emit: function (v) {
        this.on.on.emit(v);
    },
    end: function (err) {
        removeItem(this.on.subscriptions, this);

        if (err) {
            this.on.setState(CLOSED);
            this.on.on.end(err);
        } else {
            var next = this.on.iterator.next();

            if (next.done) {
                this.on.on.end(null);
            } else {
                new MergeItem(next.value, this.on);
            }
        }
    },
    setState: setStateThru
}
