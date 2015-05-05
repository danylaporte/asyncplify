Asyncplify.combineLatest = function (options) {
    return new Asyncplify(CombineLatest, options)
}

function CombineLatest(options, on) {
    this.mapper = options && options.mapper || null;
    this.on = on;
    this.state = RUNNING;
    this.subscriptions = [];
    
    on.source = this;
	
	var items = options && options.items || options;

    if (!Array.isArray(items)) {
        throw Error('items are not an array');
    }

    var next;
    var iterator = new ArrayIterator(items);

    while (!(next = iterator.next()).done) {
        this.subscriptions.push(new CombineLatestItem(next.value, this));
    }
    
    this.subscribeCount = options && options.emitUndefined ? this.subscriptions.length : 0;
    !this.subscriptions.length && on.end(null);
	
	for (var i = 0; i < this.subscriptions.length && this.state === RUNNING; i++) {
        this.subscriptions[i].do();
    }
}

CombineLatest.prototype = {
    getValues: function () {
        var array = [];
        for (var i = 0; i < this.subscriptions.length; i++) {
            array.push(this.subscriptions[i].value);
        }
        return array;
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;

            for (var i = 0; i < this.subscriptions.length; i++) {
                this.subscriptions[i].setState(this.state);
            }
        }
    }
}

function CombineLatestItem(item, on) {
    this.hasValue = false;
    this.item = item;
    this.on = on;
    this.source = null;
    this.state = RUNNING;
    this.value = undefined;
}

CombineLatestItem.prototype = {
    do: function () {
        this.source ? this.source.setState(this.state) : this.item._subscribe(this);
    },
    emit: function (v) {
        this.value = v;
        
        if (!this.hasValue) {
            this.hasValue = true;
            this.on.subscribeCount++;
        }
        
        if (this.on.subscribeCount >= this.on.subscriptions.length) {
            var array = this.on.getValues();
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