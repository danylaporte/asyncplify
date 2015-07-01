Asyncplify.combineLatest = function (options) {
    return new Asyncplify(CombineLatest, options);
};

function CombineLatest(options, sink) {
    var items = options && options.items || options;
    
    this.closableCount = items.length;
    this.mapper = options && options.mapper || null;
    this.missingValuesCount = options && options.emitUndefined ? 0 : items.length;
    this.sink = sink;
    this.sink.source = this;
    this.subscriptions = [];
    this.values = [];
    
    var i;
    
    for (i = 0; i < items.length; i++)
        this.values.push(undefined);

    for ( i = 0; i < items.length; i++)
        this.subscriptions.push(new CombineLatestItem(items[i], this, i));
        
    if (!items.length)
        this.sink.end(null);
}

CombineLatest.prototype.close = function () {
    if (this.sink) {
        this.sink = null;

        for (var i = 0; i < this.subscriptions.length; i++)
            this.subscriptions[i].close();
    }
};

function CombineLatestItem(source, parent, index) {
    this.hasValue = false;
    this.index = index;
    this.parent = parent;
    this.source = null;
    
    source._subscribe(this);
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
            this.parent.values[this.index] = v;

            if (!this.hasValue) {
                this.hasValue = true;
                this.parent.missingValuesCount--;
            }
    
            if (this.parent.missingValuesCount <= 0) {
                var array = this.parent.values.slice();
                this.parent.sink.emit(this.parent.mapper ? this.parent.mapper.apply(null, array) : array);
            }
        }
    },
    end: function (err) {
        if (this.source) {
            this.source = null;
            this.parent.closableCount--;
            
            if (err || !this.parent.closableCount) {
                this.parent.sink.end(err);
                if (err) this.parent.close();
            }
        }
    }
};