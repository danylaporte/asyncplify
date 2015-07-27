Asyncplify.zip = function (options) {
    return new Asyncplify(Zip, options);
};

var zipDebug = debug('asyncplify:zip');

function Zip(options, sink) {
    var items = options && options.items || options;
    
    this.mapper = options && options.mapper || null;
    
    if (!Array.isArray(items)) items = this.objectMap(items);    
    
    this.sink = sink;
    this.sink.source = this;
    this.subscribables = items.length;
    this.subscriptions = [];
    
    zipDebug('subscribe to %d item(s)', items.length);

    for (var i = 0; i < items.length && this.sink; i++) {
        this.subscribables--;
        new ZipItem(items[i], this, i);
    }
    
    if (!items.length) this.sink.end(null);
}

Zip.prototype = {
    objectMap: function (obj) {
        var array = [];
        var mapping = [];
        
        for (var k in obj) {
            var source;
            
            if (obj.hasOwnProperty(k) && (source = obj[k]) && source._subscribe) {
                array.push(source);
                mapping.push(k);
            }
        }
        
        this.mapper = function () {
            var obj = {};
            
            for (var i = 0; i < mapping.length; i++)
                obj[mapping[i]] = arguments[i];
                
            return obj;
        }
        
        return array;
    },
    setState: function (state) {
        for (var i = 0; i < this.subscriptions.length; i++)
            this.subscriptions[i].setState(state);
    }
}

function ZipItem(source, parent, index) {
    this.index = index;
    this.items = [];
    this.parent = parent;
    this.source = null;
    
    parent.subscriptions.push(this);
    source._subscribe(this);
}

ZipItem.prototype = {
    emit: function (v) {
        zipDebug('child %d received %j', this.index, v);
        this.items.push(v);

        if (this.items.length === 1 && !this.parent.subscribables) {
            var array = [];
            var i, s;
            var subscriptions = this.parent.subscriptions;
            
            for (i = 0; i < subscriptions.length; i++)
                if (!subscriptions[i].items.length) return;

            for (i = 0; i < subscriptions.length; i++)
                array.push(subscriptions[i].items.shift());
            
            var result = this.parent.mapper ? this.parent.mapper.apply(null, array) : array;
            
            zipDebug('emit %j', result);
            this.parent.sink.emit(result);
            
            for (i = 0; i < subscriptions.length; i++) {
                s = subscriptions[i];
                
                if (!s.source && !s.items.length) {
                    zipDebug('end');
                    this.parent.mapper = noop;
                    this.parent.setState(Asyncplify.states.CLOSED);
                    this.parent.sink.end(null);
                    this.parent.sink = NoopSink.instance;
                    break;
                }
            }
        }
    },
    end: function (err) {
        this.source = null;
        zipDebug('child %d end %j', this.index, err);
        
        if (err || !this.items.length) {
            if (!err) zipDebug('end');
            this.parent.setState(Asyncplify.states.CLOSED);
            this.parent.mapper = noop;
            this.parent.sink.end(err);
            this.parent.sink = NoopSink.instance;
        }
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};