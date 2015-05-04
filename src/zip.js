Asyncplify.zip = function (options) {
    return new Asyncplify(Zip, options)
}

function Zip(options, on) {
    var items = options.items || options || [];

    this.mapper = options && options.mapper || null;
    this.on = on;
    this.state = RUNNING;
    this.subscriptions = [];
    on.source = this;

    var i;

    for (i = 0; i < items.length; i++) {
        this.subscriptions.push(new ZipItem(items[i], this));
    }

    for (i = 0; i < this.subscriptions.length && this.state === RUNNING; i++) {
        this.subscriptions[i].do();
    }

    !this.subscriptions.length && on.end(null);
}

Zip.prototype = {
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;

            for (var i = 0; i < this.subscriptions.length; i++) {
                this.subscriptions[i].setState(this.state);
            }
        }
    }
}

function ZipItem(item, on) {
    this.item = item;
    this.items = [];
    this.on = on;
    this.source = null;
    this.state = PAUSED;
}

ZipItem.prototype = {
    do: function () {
        this.source ? this.source.setState(this.state) : this.item._subscribe(this);
    },
    emit: function (v) {
        this.items.push(v);

        if (this.items.length === 1) {
            var array = [];
            var subscriptions = this.on.subscriptions;
            var i;

            for (i = 0; i < subscriptions.length; i++) {
                if (!subscriptions[i].items.length) {
                     return;
                }
            }

            for (i = 0; i < subscriptions.length; i++) {
                array.push(subscriptions[i].items.splice(0, 1)[0]);
            }
            
            this.on.on.emit(this.on.mapper ? this.on.mapper.apply(null, array) : array);
        }
    },
    end: function (err) {
        this.state = CLOSED;

        if (!err) {
            for (var i = 0; i < this.on.subscriptions.length; i++) {
                if (this.on.subscriptions[i].state !== CLOSED) {
                    return;
                }
            }
        }

        this.on.setState(CLOSED);
        this.on.on.end(err);
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;
            state === RUNNING && this.do();
        }
    }
}
