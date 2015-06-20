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

    for (i = 0; i < this.subscriptions.length; i++) {
        this.subscriptions[i].setState(this.state);
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
            
            for (i = 0; i < subscriptions.length; i++) {
                var s = subscriptions[i];
                
                if (s.state === CLOSED && !s.items.length) {
                    this.on.setState(CLOSED);
                    this.on.on.end(null);
                    break;
                }
            }
        }
    },
    end: function (err) {
        if (this.state === CLOSED) return;
        this.state = CLOSED;
        
        if (err || !this.items.length) {
            this.on.setState(CLOSED);
            this.on.on.end(err);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;
            this.source ? this.source.setState(state) : (state === RUNNING && this.item._subscribe(this));
        }
    }
}