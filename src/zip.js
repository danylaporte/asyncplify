Asyncplify.zip = function (options) {
    return new Asyncplify(Zip, options);
};

function Zip(options, sink) {
    var items = options.items || options || [];

    this.mapper = options && options.mapper || null;
    this.sink = sink;
    this.sink.source = this;
    this.subscribables = items.length;
    this.subscriptions = [];

    for (var i = 0; i < items.length && this.sink; i++) {
        this.subscribables--;
        new ZipItem(items[i], this);
    }
    
    if (!items.length) this.sink.end(null);
}

Zip.prototype = {
    close: function () {
        this.sink = null;
        this.closeSubscriptions();
    },
    closeSubscriptions: function () {
        for (var i = 0; i < this.subscriptions.length; i++)
            this.subscriptions[i].close();

        this.mapper = null;
        this.subscriptions.length = 0;
    }
};

function ZipItem(source, parent) {
    this.items = [];
    this.parent = parent;
    this.source = null;
    
    parent.subscriptions.push(this);
    source._subscribe(this);
}

ZipItem.prototype = {
    close: function () {
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (v) {
        this.items.push(v);

        if (this.items.length === 1 && !this.parent.subscribables && this.parent.sink) {
            var array = [];
            var i, s;
            var subscriptions = this.parent.subscriptions;

            for (i = 0; i < subscriptions.length; i++) {
                s = subscriptions[i];
                if (!s.items.length) return;
                array.push(s.items.splice(0, 1)[0]);
            }
            
            this.parent.sink.emit(this.parent.mapper ? this.parent.mapper.apply(null, array) : array);
            
            for (i = 0; i < subscriptions.length; i++) {
                s = subscriptions[i];
                
                if (!s.source && !s.items.length) {
                    this.parent.closeSubscriptions();
                    
                    var sink = this.parent.sink;
                    this.parent.sink = null;
                    if (sink) sink.end(null);
                    break;
                }
            }
        }
    },
    end: function (err) {
        this.source = null;
        
        if ((err || !this.items.length) && this.parent.sink) {
            var sink = this.parent.sink;
            this.parent.sink = null;
            sink.end(err);
        }
    }
};