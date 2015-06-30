Asyncplify.combineLatest = function (options) {
    return new Asyncplify(CombineLatest, options);
};

function CombineLatest(options, sink) {
    this.mapper = options && options.mapper || null;
    this.sink = sink;
    this.subscriptions = [];

    sink.source = this;

    var i;
    var items = options && options.items || options;

    for (i = 0; i < items.length; i++)
        this.subscriptions.push(new CombineLatestItem(items[i], this));

    this.subscribeCount = options && options.emitUndefined ? this.subscriptions.length : 0;
    !this.subscriptions.length && sink.end(null);

    for (i = 0; i < this.subscriptions.length && this.sink; i++)
        this.subscriptions[i].subscribe();
}

CombineLatest.prototype = {
    close: function () {
        if (this.sink) {
            this.sink = null;

            for (var i = 0; i < this.subscriptions.length; i++)
                this.subscriptions[i].close();
        }
    },
    getValues: function () {
        var array = [];
        for (var i = 0; i < this.subscriptions.length; i++)
            array.push(this.subscriptions[i].value);
        return array;
    }
};

function CombineLatestItem(item, parent) {
    this.hasValue = false;
    this.item = item;
    this.parent = parent;
    this.source = null;
    this.value = undefined;
}

CombineLatestItem.prototype = {
    close: function () {
        this.parent = null;
        
        if (this.source)
            this.source.close();
            
        this.source = null;
    },
    emit: function (v) { 
        if (this.parent && this.parent.sink) {
            this.value = v;

            if (!this.hasValue) {
                this.hasValue = true;
                this.parent.subscribeCount++;
            }
    
            if (this.parent.subscribeCount >= this.parent.subscriptions.length) {
                var array = this.parent.getValues();
                this.parent.sink.emit(this.parent.mapper ? this.parent.mapper.apply(null, array) : array);
            }
        }
    },
    end: function (err) {
        this.source = null;
        
        if (!this.parent) return;
        
        if (!err)
            for (var i = 0; i < this.parent.subscriptions.length; i++)
                if (this.parent.subscriptions[i].source)
                    return;
                    
        var sink = this.parent.sink;
        if (sink) {
            this.parent.close();
            sink.end(err);
        }
    },
    subscribe: function () {
        this.item._subscribe(this);
    }
};