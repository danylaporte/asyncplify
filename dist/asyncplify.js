(function () {
    'use strict';
    function ArrayIterator(array) {
        this.array = array;
        this.i = 0;
    }
    ArrayIterator.prototype.next = function () {
        return {
            done: this.i >= this.array.length,
            value: this.i < this.array.length ? this.array[this.i++] : undefined
        };
    };
    function Asyncplify(func, arg, source) {
        this._arg = arg;
        this._func = func;
        this._src = source;
    }
    Asyncplify.prototype._subscribe = function (observer) {
        new this._func(this._arg, observer, this._src, this);
    };
    Asyncplify.prototype.catch = function (options) {
        return new Asyncplify(Catch, options, this);
    };
    function Catch(options, on, source) {
        this.i = 0;
        this.on = on;
        this.options = options;
        this.source = null;
        if (typeof options === 'function')
            this.mapper = options;
        on.source = this;
        source._subscribe(this);
    }
    Catch.prototype = {
        emit: emitThru,
        end: function (err) {
            if (err) {
                var source = this.mapper(err);
                if (source)
                    return source._subscribe(this);
            }
            this.on.end(err);
        },
        mapper: function () {
            return this.i < this.options.length && this.options[this.i++];
        },
        setState: setStateThru
    };
    Asyncplify.combineLatest = function (options) {
        return new Asyncplify(CombineLatest, options);
    };
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
    };
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
    };
    var RUNNING = 0;
    var PAUSED = 1;
    var CLOSED = 2;
    Asyncplify.states = {
        RUNNING: RUNNING,
        PAUSED: PAUSED,
        CLOSED: CLOSED
    };
    Asyncplify.prototype.count = function (cond) {
        return new Asyncplify(Count, cond || condTrue, this);
    };
    function Count(cond, on, source) {
        this.cond = cond;
        this.value = 0;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Count.prototype = {
        emit: function (value) {
            this.cond(value) && this.value++;
        },
        end: function (err) {
            !err && this.on.emit(this.value);
            this.on.end(err);
        },
        setState: setStateThru
    };
    Asyncplify.prototype.debounce = function (options) {
        return new Asyncplify(Debounce, options, this);
    };
    function Debounce(options, on, source) {
        this.endCalled = false;
        this.itemPending = false;
        this.on = on;
        this.scheduler = (options && options.scheduler || schedulers.timeout)();
        this.source = null;
        this.state = RUNNING;
        this.value = null;
        this.item = {
            action: this.action.bind(this),
            delay: options && options.delay || typeof options === 'number' && options || 0
        };
        on.source = this;
        this.scheduler.itemDone = this.scheduledItemDone.bind(this);
        source._subscribe(this);
    }
    Debounce.prototype = {
        action: function () {
            var v = this.value;
            this.itemPending = false;
            this.value = undefined;
            this.on.emit(v);
        },
        emit: function (value) {
            this.itemPending = true;
            this.value = value;
            this.scheduler.cancel(this.item);
            this.scheduler.schedule(this.item);
        },
        end: function (err) {
            this.endCalled = true;
            if (err || !this.itemPending) {
                this.state = CLOSED;
                this.scheduler.close();
                this.on.end(err);
            }
        },
        scheduledItemDone: function (err) {
            if (err || this.endCalled && this.state === RUNNING) {
                this.state = CLOSED;
                this.on.end(err);
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                this.source.setState(state);
                if (state === RUNNING) {
                    if (this.itemPending)
                        this.scheduler.setState(state);
                    else if (this.endCalled) {
                        this.state = CLOSED;
                        this.on.end(null);
                    }
                }
            }
        }
    };
    Asyncplify.prototype.defaultIfEmpty = function (value) {
        return new Asyncplify(DefaultIfEmpty, value, this);
    };
    function DefaultIfEmpty(value, on, source) {
        this.hasValue = false;
        this.on = on;
        this.source = null;
        this.value = value;
        on.source = this;
        source._subscribe(this);
    }
    DefaultIfEmpty.prototype = {
        emit: function (value) {
            this.hasValue = true;
            this.on.emit(value);
        },
        end: function (err) {
            !err && !this.hasValue && this.on.emit(this.value);
            this.on.end(err);
        },
        setState: setStateThru
    };
    Asyncplify.empty = function () {
        return new Asyncplify(Empty);
    };
    function Empty(_, on) {
        on.source = this;
        on.end(null);
    }
    Empty.prototype.setState = noop;
    if (typeof module !== 'undefined') {
        module.exports = Asyncplify;
    } else if (typeof window !== 'undefined') {
        window.Asyncplify = Asyncplify;
    }
    Asyncplify.prototype.filter = function (cond) {
        if (typeof cond === 'function')
            return new Asyncplify(Filter, cond, this);
        if (cond === false)
            return new Asyncplify(Filter, condFalse, this);
        return this;
    };
    function Filter(cond, on, source) {
        this.cond = cond;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Filter.prototype = {
        emit: function (value) {
            this.cond(value) && this.on.emit(value);
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.prototype.finally = function (action) {
        return action ? new Asyncplify(Finally, action, this) : this;
    };
    function Finally(action, on, source) {
        this.action = action;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Finally.prototype = {
        emit: emitThru,
        end: function (err) {
            this.action();
            this.on.end(err);
        },
        setState: function (state) {
            this.source.setState(state);
            this.action();
        }
    };
    Asyncplify.prototype.flatMap = function (options) {
        return new Asyncplify(FlatMap, options, this);
    };
    function FlatMap(options, on, source) {
        this.items = [];
        this.mapper = options.mapper || options;
        this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    FlatMap.prototype = {
        childEnd: function (err, item) {
            var count = this.items.length;
            removeItem(this.items, item);
            if (err) {
                this.setState(CLOSED);
                this.on.end(err);
            } else if (!this.items.length && !this.source) {
                this.on.end(null);
            } else if (this.source && this.maxConcurrency && count === this.maxConcurrency) {
                this.source.setState(RUNNING);
            }
        },
        emit: function (v) {
            var item = this.mapper(v);
            if (item) {
                var flatMapItem = new FlatMapItem(this);
                this.items.push(flatMapItem);
                this.maxConcurrency && this.items.length === this.maxConcurrency && this.source.setState(PAUSED);
                item._subscribe(flatMapItem);
            }
        },
        end: function (err) {
            this.source = null;
            err && this.setState(CLOSED);
            (err || !this.items.length) && this.on.end(err);
        },
        setState: function (state) {
            this.source && (state !== RUNNING || !this.maxConcurrency || this.items.length < this.maxConcurrency) && this.source.setState(state);
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].setState(state);
            }
        }
    };
    function FlatMapItem(on) {
        this.on = on;
        this.source = null;
    }
    FlatMapItem.prototype = {
        emit: function (v) {
            this.on.on.emit(v);
        },
        end: function (err) {
            this.on.childEnd(err, this);
        },
        setState: setStateThru
    };
    Asyncplify.prototype.flatMapLatest = function (options) {
        return new Asyncplify(FlatMapLatest, options, this);
    };
    function FlatMapLatest(options, on, source) {
        this.item = null;
        this.mapper = options.mapper || options;
        this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    FlatMapLatest.prototype = {
        childEnd: function (err, item) {
            this.item = null;
            if (err) {
                this.setState(CLOSED);
                this.on.end(err);
            } else if (!this.source) {
                this.on.end(null);
            }
        },
        emit: function (v) {
            var item = this.mapper(v);
            if (item) {
                this.item && this.item.setState(CLOSED);
                this.item = new FlatMapItem(this);
                item._subscribe(this.item);
            }
        },
        end: function (err) {
            this.source = null;
            err && this.setState(CLOSED);
            (err || !this.item) && this.on.end(err);
        },
        setState: function (state) {
            this.source && this.source.setState(state);
            this.item && this.item.setState(state);
        }
    };
    Asyncplify.fromArray = function (array) {
        return new Asyncplify(FromArray, array);
    };
    function FromArray(array, on) {
        this.array = array;
        this.i = 0;
        this.state = RUNNING;
        this.on = on;
        on.source = this;
        this.do();
    }
    FromArray.prototype = {
        do: function () {
            while (this.i < this.array.length && this.state === RUNNING) {
                this.on.emit(this.array[this.i++]);
            }
            if (this.state === RUNNING) {
                this.state = CLOSED;
                this.on.end(null);
            }
        },
        setState: setState
    };
    Asyncplify.fromNode = function (func) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return new Asyncplify(FromNode, [
            func,
            args
        ]);
    };
    function FromNode(options, on) {
        this.error = null;
        this.hasValue = false;
        this.on = on;
        this.state = RUNNING;
        this.value = null;
        on.source = this;
        var self = this;
        function callback(err, value) {
            if (self.state === RUNNING) {
                self.state = CLOSED;
                if (!err)
                    self.on.emit(value);
                self.on.end(err);
            } else {
                self.hasValue = true;
                self.value = value;
                self.error = err;
            }
        }
        options[0].apply(options.self, options[1].concat([callback]));
    }
    FromNode.prototype = {
        do: function () {
            if (this.hasValue) {
                this.state = CLOSED;
                if (!this.error)
                    this.on.emit(this.value);
                this.on.end(this.error);
            }
        },
        setState: setState
    };
    Asyncplify.fromPromise = function (promise, cb) {
        return new Asyncplify(FromPromise, promise);
    };
    function FromPromise(promise, on) {
        this.on = on;
        this.resolved = 0;
        this.state = RUNNING;
        this.value = null;
        on.source = this;
        var self = this;
        function resolve(v) {
            if (self.state === RUNNING) {
                self.state = CLOSED;
                self.on.emit(v);
                self.on.end(null);
            } else {
                self.resolved = 1;
                self.value = v;
            }
        }
        function rejected(err) {
            if (self.state === RUNNING) {
                self.state = CLOSED;
                self.on.end(err);
            } else {
                self.resolved = 2;
                self.value = err;
            }
        }
        promise.then(resolve, rejected);
    }
    FromPromise.prototype = {
        do: function () {
            if (this.resolved === 1) {
                this.state = CLOSED;
                this.on.emit(this.value);
                this.on.end(null);
            } else if (this.resolved === 2) {
                this.state = CLOSED;
                this.on.end(this.value);
            }
        },
        setState: setState
    };
    Asyncplify.fromRx = function (obs) {
        return new Asyncplify(FromRx, obs);
    };
    function FromRx(obs, on) {
        on.source = this;
        function next(value) {
            on.emit(value);
        }
        function error(err) {
            on.end(err);
        }
        function completed() {
            on.end(null);
        }
        this.subscription = obs.subscribe(next, error, completed);
    }
    FromRx.prototype.setState = function (state) {
        if (state === CLOSED)
            this.subscription.dispose();
    };
    Asyncplify.prototype.groupBy = function (options) {
        return new Asyncplify(GroupBy, options, this);
    };
    function GroupBy(options, on, source) {
        this.elementSelector = options && options.elementSelector || identity;
        this.keySelector = typeof options === 'function' ? options : options && options.keySelector || identity;
        this.on = on;
        this.store = options && options.store || {};
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    GroupBy.prototype = {
        emit: function (v) {
            var key = this.keySelector(v);
            var group = this.store[key];
            if (!group) {
                group = this.store[key] = Asyncplify.subject();
                group.key = key;
                this.on.emit(group);
            }
            group.emit(this.elementSelector(v));
        },
        end: function (err) {
            for (var k in this.store) {
                this.store[k].end(null);
            }
            this.on.end(err);
        }
    };
    Asyncplify.prototype.ignoreElements = function () {
        return new Asyncplify(IgnoreElements, null, this);
    };
    function IgnoreElements(_, on, source) {
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    IgnoreElements.prototype = {
        emit: noop,
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.infinite = function () {
        return new Asyncplify(Infinite);
    };
    function Infinite(_, on) {
        this.on = on;
        this.state = RUNNING;
        on.source = this;
        this.do();
    }
    Infinite.prototype = {
        do: function () {
            while (this.state === RUNNING) {
                this.on.emit();
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                if (state === RUNNING)
                    this.do();
            }
        }
    };
    Asyncplify.interval = function (options) {
        return new Asyncplify(Interval, options);
    };
    function Interval(options, on) {
        this.i = 0;
        this.item = {
            action: noop,
            delay: options && options.delay || typeof options === 'number' && options || 0
        };
        this.itemPending = true;
        this.scheduler = (options && options.scheduler || schedulers.timeout)();
        this.on = on;
        this.state = RUNNING;
        on.source = this;
        this.scheduler.itemDone = this.scheduledItemDone.bind(this);
        this.scheduler.schedule(this.item);
    }
    Interval.prototype = {
        scheduledItemDone: function (err) {
            this.itemPending = false;
            if (this.err) {
                this.state = CLOSED;
                this.on.end(err);
            } else {
                this.on.emit(this.i++);
                this.state === RUNNING && this.scheduler.schedule(this.item);
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                if (state === RUNNING) {
                    !this.itemPending && this.scheduler.schedule(this.item);
                } else {
                    this.scheduler.setState(state);
                }
            }
        }
    };
    Asyncplify.prototype.last = function (options) {
        return new Asyncplify(Last, options, this);
    };
    function Last(options, on, source) {
        this.count = 1;
        this.cond = condTrue;
        this.items = [];
        this.on = on;
        this.source = null;
        this.state = RUNNING;
        setCountAndCond(this, options);
        if (!this.count) {
            this.state = CLOSED;
            on.end(null);
        } else {
            on.source = this;
            source._subscribe(this);
        }
    }
    Last.prototype = {
        do: function () {
            while (this.items.length && this.state === RUNNING) {
                this.on.emit(this.items.pop());
            }
            if (this.state === RUNNING) {
                this.state = CLOSED;
                this.on.end(null);
            }
        },
        emit: function (value) {
            if (this.cond(value)) {
                this.items.unshift(value);
                this.count > 0 && this.items.length > this.count && this.items.pop();
            }
        },
        end: function (err) {
            this.source = null;
            if (err) {
                this.state = CLOSED;
                this.end(err);
            } else {
                this.do();
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state != CLOSED) {
                this.state = state;
                this.source && this.source.setState(state);
                this.state === RUNNING && !this.source && this.do();
            }
        }
    };
    Asyncplify.prototype.map = function (mapper) {
        return mapper ? new Asyncplify(Map, mapper, this) : this;
    };
    function Map(mapper, on, source) {
        this.mapper = mapper;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Map.prototype = {
        emit: function (value) {
            this.on.emit(this.mapper(value));
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.merge = function (options) {
        return new Asyncplify(Merge, options);
    };
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
    };
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
    };
    Asyncplify.never = function () {
        return new Asyncplify(Never);
    };
    function Never(_, on) {
        on.source = this;
    }
    Never.prototype.setState = noop;
    Asyncplify.prototype.observeOn = function (options) {
        return new Asyncplify(ObserveOn, options, this);
    };
    function ObserveOn(options, on, source) {
        this.scheduler = (typeof options === 'function' ? options : options && options.scheduler || schedulers.immediate)();
        this.scheduler.itemDone = this.scheduledItemDone.bind(this);
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    ObserveOn.prototype = {
        emit: function (v) {
            this.scheduler.schedule(new ObserveOnItem(v, true, this.on));
        },
        end: function (err) {
            this.scheduler.schedule(new ObserveOnItem(err, false, this.on));
        },
        scheduledItemDone: function (err) {
            if (err) {
                this.scheduler.setState(CLOSED);
                this.on.end(err);
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                this.scheduler.setState(state);
            }
        }
    };
    function ObserveOnItem(value, isEmit, on) {
        this.isEmit = isEmit;
        this.on = on;
        this.value = value;
    }
    ObserveOnItem.prototype = {
        action: function () {
            this.isEmit ? this.on.emit(this.value) : this.on.end(this.value);
        },
        delay: 0
    };
    Asyncplify.prototype.pipe = function (func) {
        return func(this);
    };
    Asyncplify.prototype.publishRefCount = function (options) {
        var r = new Asyncplify(PublishRefCount, null, this);
        r.emit = publishRefCountEmit;
        r.end = publishRefCountEnd;
        r.setState = setStateThru;
        r.refs = [];
        r._scheduler = options && options.scheduler && options.scheduler() || schedulers.sync();
        r._scheduler.itemDone = noop;
        return r;
    };
    function publishRefCountEmit(value) {
        for (var i = 0; i < this.refs.length; i++) {
            this.refs[i].emit(value);
        }
    }
    function publishRefCountEnd(err) {
        var array = this.refs;
        this.refs = [];
        for (var i = 0; i < array.length; i++) {
            array[i].end(err);
        }
    }
    function PublishRefCount(_, on, source, asyncplify) {
        this.on = on;
        this.source = asyncplify;
        on.source = this;
        asyncplify.refs.push(this);
        if (asyncplify.refs.length === 1) {
            asyncplify._scheduler.schedule({
                action: function () {
                    source._subscribe(asyncplify);
                }
            });
        }
    }
    PublishRefCount.prototype = {
        emit: emitThru,
        end: endThru,
        setState: function (state) {
            this.source._scheduler.setState(state);
            var refs = this.source.refs;
            if (refs.length) {
                if (state === CLOSED) {
                    removeItem(refs, this);
                    !refs.length && this.source.setState(CLOSED);
                } else {
                    this.source.setState(state);
                }
            }
        }
    };
    Asyncplify.range = function (options) {
        return new Asyncplify(Range, options);
    };
    function Range(options, on) {
        this.i = options && options.start || 0;
        this.end = typeof options === 'number' ? options : options && options.end || 0;
        this.step = options && options.step || 1;
        this.state = RUNNING;
        this.on = on;
        on.source = this;
        this.do();
    }
    Range.prototype = {
        do: function () {
            while (this.i < this.end && this.state === RUNNING) {
                var v = this.i;
                this.i += this.step;
                this.on.emit(v);
            }
            if (this.state === RUNNING) {
                this.state = CLOSED;
                this.on.end(null);
            }
        },
        setState: setState
    };
    /*Flow.prototype.recurse = function (options) {
    var produce = options.produce;
    var feedback = options.feedback;
    var self = this;

    return new Flow(function (subscriber) {
        var subscriptions = [];
        var paused = subscriber.paused;

        function subscribeFeedback(item) {
            var s = item.subscription({
                emit: function (v) {
                    var t = produce(v);
                    t && t.subscription && subscribeProduce(t);
                },
                end: function (err) {
                    endSubscribe(subscriptions, s, subscriber, err);
                },
                paused: true
            });

            subscriptions.push(s);
            !paused && s.resume();
        }

        function subscribeProduce(item) {
            var s = item.subscription({
                emit: function (v) {
                    if (v != undefined) {
                        subscriber.emit(v);
                        var t = feedback(v);
                        t && t.subscription && subscribeFeedback(t);
                    }
                },
                end: function (err) {
                    endSubscribe(subscriptions, s, subscriber, err);
                },
                paused: true
            });

            subscriptions.push(s);
            !paused && s.resume();
        }

        !paused && subscribeFeedback(self);

        return {
            close: function () {
                closeSubscriptions(subscriptions);
            },
            pause: function () {
                paused = true;
                pauseSubscriptions(subscriptions);
            },
            resume: function () {
                paused = false;
                resumeSubscriptions(subscriptions);
            }
        }
    });
};
*/
    Asyncplify.prototype.scan = function (options, source, cb) {
        return new Asyncplify(Scan, options, this);
    };
    function scanIdentity(acc, v) {
        return (acc || 0) + (v || 0);
    }
    function Scan(options, on, source) {
        this.mapper = typeof options === 'function' ? options : options && options.mapper || scanIdentity;
        this.acc = options && options.initial || 0;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Scan.prototype = {
        emit: function (value) {
            this.acc = this.mapper(this.acc, value);
            this.on.emit(this.acc);
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.prototype.skip = function (count) {
        return typeof count !== 'number' || count <= 0 ? this : new Asyncplify(Skip, count, this);
    };
    function Skip(count, on, source) {
        this.count = count;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Skip.prototype = {
        emit: function (value) {
            if (this.count > 0) {
                this.count--;
            } else {
                this.on.emit(value);
            }
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.prototype.skipLast = function (count) {
        return new Asyncplify(SkipLast, typeof count === 'number' ? count : 1, this);
    };
    function SkipLast(count, on, source) {
        this.count = count;
        this.on = on;
        this.source = null;
        this.items = [];
        on.source = this;
        source._subscribe(this);
    }
    SkipLast.prototype = {
        emit: function (value) {
            this.items.push(value);
            this.items.length > this.count && this.on.emit(this.items.splice(0, 1)[0]);
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.prototype.skipUntil = function (trigger) {
        return new Asyncplify(SkipUntil, trigger, this);
    };
    function SkipUntil(trigger, on, source) {
        this.can = false;
        this.on = on;
        this.source = null;
        this.trigger = null;
        on.source = this;
        new Trigger(trigger, this);
        source._subscribe(this);
    }
    SkipUntil.prototype = {
        emit: function (value) {
            this.can && this.on.emit(value);
        },
        end: function (err) {
            if (this.trigger) {
                this.trigger.setState(CLOSED);
                this.trigger = null;
            }
            this.on.end(err);
        },
        setState: function (state) {
            this.trigger && this.trigger.setState(state);
            this.source && this.source.setState(CLOSED);
            if (state === CLOSED) {
                this.trigger = null;
            }
        },
        triggerEmit: function () {
            this.trigger && this.trigger.setState(CLOSED);
            this.trigger = null;
            this.can = true;
        }
    };
    Asyncplify.prototype.skipWhile = function (cond) {
        return new Asyncplify(SkipWhile, cond, this);
    };
    function SkipWhile(cond, on, source) {
        this.can = false;
        this.cond = cond;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    SkipWhile.prototype = {
        emit: function (value) {
            if (this.can || !this.cond(value)) {
                this.can = true;
                this.on.emit(value);
            }
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.subject = function () {
        var r = new Asyncplify(Subject);
        r.subjects = [];
        r.emit = subjectEmit;
        r.end = subjectEnd;
        r._src = r;
        return r;
    };
    function subjectEmit(value) {
        for (var i = 0; i < this.subjects.length; i++) {
            this.subjects[i].emit(value);
        }
    }
    function subjectEnd(err) {
        for (var i = 0; i < this.subjects.length; i++) {
            this.subjects[i].end(err);
        }
    }
    function Subject(_, on, source) {
        this.on = on;
        this.source = source;
        this.state = RUNNING;
        this.endCalled = false;
        this.err = null;
        on.source = this;
        source.subjects.push(this);
    }
    Subject.prototype = {
        do: function () {
            if (this.endCalled) {
                this.state = CLOSED;
                this.on.end(this.err);
            }
        },
        emit: function (value) {
            this.state === RUNNING && this.on.emit(value);
        },
        end: function (err) {
            if (this.state === RUNNING) {
                this.state = CLOSED;
                this.on.end(err);
            } else if (this.state === PAUSED) {
                this.endCalled = true;
                this.err = err;
            }
        },
        setState: function (state) {
            if (this.state !== CLOSED && this.state !== state) {
                this.state = state;
                state === CLOSED && removeItem(this.source.subjects, this);
                state === RUNNING && this.do();
            }
        }
    };
    Asyncplify.prototype.subscribe = function (options) {
        return new Subscribe(options || {}, this);
    };
    function Subscribe(options, source) {
        this.emit = options.emit || typeof options === 'function' && options || noop;
        this.end = options.end || noop;
        this.source = null;
        source._subscribe(this);
    }
    Subscribe.prototype = {
        close: function () {
            this.source.setState(CLOSED);
        },
        pause: function () {
            this.source.setState(PAUSED);
        },
        resume: function () {
            this.source.setState(RUNNING);
        }
    };
    Asyncplify.prototype.subscribeOn = function (options) {
        return new Asyncplify(SubscribeOn, options, this);
    };
    function SubscribeOn(options, on, source) {
        this.origin = source;
        this.on = on;
        this.scheduler = (typeof options === 'function' ? options : options && options.scheduler || schedulers.immediate)();
        this.scheduler.itemDone = noop;
        this.source = null;
        on.source = this;
        this.scheduler.schedule(this);
    }
    SubscribeOn.prototype = {
        action: function () {
            this.origin._subscribe(this);
        },
        emit: emitThru,
        end: endThru,
        setState: function (state) {
            this.source ? this.source.setState(state) : this.scheduler.setState(state);
        }
    };
    Asyncplify.prototype.sum = function (mapper, source, cb) {
        return new Asyncplify(Sum, mapper || identity, this);
    };
    function Sum(mapper, on, source) {
        this.hasValue = false;
        this.mapper = mapper;
        this.value = 0;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    Sum.prototype = {
        emit: function (value) {
            this.value += this.mapper(value) || 0;
            this.hasValue = true;
        },
        end: function (err) {
            !err && this.hasValue && this.on.emit(this.value);
            this.on.end(err);
        },
        setState: setStateThru
    };
    Asyncplify.prototype.take = function (options) {
        return new Asyncplify(Take, options, this);
    };
    function Take(options, on, source) {
        this.cond = condTrue;
        this.count = -1;
        this.on = on;
        this.source = null;
        setCountAndCond(this, options);
        if (!this.count) {
            this.on.end(null);
        } else {
            on.source = this;
            source._subscribe(this);
        }
    }
    Take.prototype = {
        emit: function (value) {
            if (this.cond(value)) {
                if (!--this.count) {
                    this.source.setState(CLOSED);
                    this.on.emit(value);
                    this.on.end(null);
                } else {
                    this.on.emit(value);
                }
            }
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.prototype.takeUntil = function (trigger) {
        return new Asyncplify(TakeUntil, trigger, this);
    };
    function TakeUntil(trigger, on, source) {
        this.on = on;
        this.source = null;
        this.trigger = null;
        on.source = this;
        new Trigger(trigger, this);
        this.trigger && source._subscribe(this);
    }
    TakeUntil.prototype = {
        emit: emitThru,
        end: function (err) {
            if (this.trigger) {
                this.trigger.setState(CLOSED);
                this.trigger = null;
            }
            this.on.end(err);
        },
        setState: function (state) {
            this.trigger && this.trigger.setState(state);
            this.source && this.source.setState(CLOSED);
            if (state === CLOSED) {
                this.trigger = null;
            }
        },
        triggerEmit: function () {
            this.setState(CLOSED);
            this.on.end(null);
        }
    };
    Asyncplify.prototype.takeWhile = function (cond) {
        return new Asyncplify(TakeWhile, cond, this);
    };
    function TakeWhile(cond, on, source) {
        this.cond = cond;
        this.on = on;
        this.source = null;
        on.source = this;
        source._subscribe(this);
    }
    TakeWhile.prototype = {
        emit: function (value) {
            if (this.cond(value)) {
                this.on.emit(value);
            } else {
                this.source.setState(CLOSED);
                this.on.end(null);
            }
        },
        end: endThru,
        setState: setStateThru
    };
    Asyncplify.prototype.tap = function (options) {
        return new Asyncplify(Tap, options, this);
    };
    function Tap(options, on, source) {
        this._emit = options && options.emit || typeof options === 'function' && options || noop;
        this.on = on;
        this.options = options;
        this.source = null;
        on.source = this;
        if (options && options.subscribe)
            options.subscribe({
                on: on,
                source: source
            });
        source._subscribe(this);
    }
    Tap.prototype = {
        emit: function (value) {
            this._emit(value);
            this.on.emit(value);
        },
        end: function (err) {
            if (this.options && this.options.end)
                this.options.end(err);
            this.on.end(err);
        },
        setState: function (state) {
            if (this.options && this.options.setState)
                this.options.setState(state);
            this.source.setState(state);
        }
    };
    Asyncplify.throw = function (err, cb) {
        return new Asyncplify(Throw, err);
    };
    function Throw(err, on) {
        on.source = this;
        on.end(err);
    }
    Throw.prototype.setState = noop;
    Asyncplify.prototype.timeout = function (options) {
        return new Asyncplify(Timeout, options, this);
    };
    function Timeout(options, on, source) {
        var self = this;
        var other = options instanceof Asyncplify ? options : options && options.other || Asyncplify.throw(new Error('Timeout'));
        this.on = on;
        this.scheduler = (options && options.scheduler || schedulers.timeout)();
        this.source = null;
        on.source = this;
        this.scheduler.schedule({
            action: function () {
                self.source.setState(CLOSED);
                other._subscribe(self);
            },
            delay: typeof options === 'number' ? options : options && options.delay || 0,
            dueTime: options instanceof Date ? options : options && options.dueTime
        });
        source._subscribe(this);
    }
    Timeout.prototype = {
        closeScheduler: function () {
            if (this.scheduler) {
                this.scheduler.setState(CLOSED);
                this.scheduler = null;
            }
        },
        emit: function (value) {
            this.closeScheduler();
            this.on.emit(value);
        },
        end: function (err) {
            this.closeScheduler();
            this.on.end(err);
        },
        setState: function (state) {
            this.scheduler && this.scheduler.setState(state);
            this.source.setState(state);
        }
    };
    Asyncplify.prototype.toArray = function (options, source, cb) {
        return new Asyncplify(ToArray, options || {}, this);
    };
    function ToArray(options, on, source) {
        this.array = [];
        this.emitEmpty = options.emitEmpty || false;
        this.on = on;
        this.splitCond = null;
        this.splitLength = 0;
        this.trigger = null;
        this.hasEmit = false;
        this.source = null;
        if (options.split) {
            if (typeof options.split === 'number') {
                if (options.split > 0) {
                    this.splitLength = options.split;
                    this.emit = toArraySplitLength;
                }
            } else if (typeof options.split === 'function') {
                this.splitCond = options.split;
                this.emit = toArraySplitCond;
            } else if (options.split instanceof Asyncplify) {
                new Trigger(options.split, this);
            }
        }
        on.source = this;
        source._subscribe(this);
    }
    function toArraySplitCond(v) {
        (this.emitEmpty || this.array.length) && this.splitCond(v, this.array) && this.emitArray();
        this.array.push(v);
    }
    function toArraySplitLength(v) {
        this.array.push(v);
        this.splitLength && this.array.length >= this.splitLength && this.emitArray();
    }
    ToArray.prototype = {
        emit: function (value) {
            this.array.push(value);
        },
        emitArray: function () {
            var a = this.array;
            this.array = [];
            this.hasEmit = true;
            this.on.emit(a);
        },
        end: function (err) {
            !err && (this.array.length || !this.hasEmit && this.emitEmpty) && this.on.emit(this.array);
            if (this.trigger) {
                this.trigger.setState(CLOSED);
                this.trigger = null;
            }
            this.on.end(err);
        },
        setState: function (state) {
            this.source.setState(state);
            this.trigger && this.trigger.setState(state);
        },
        triggerEmit: function () {
            (this.array.length || this.emitEmpty) && this.emitArray();
        }
    };
    Asyncplify.prototype.transduce = function (transformer, source, cb) {
        return new Asyncplify(Transduce, transformer, this);
    };
    function Transduce(transformer, on, source) {
        this.acc = null;
        this.on = on;
        this.source = null;
        this.transformer = transformer(this);
        this.transformer['@@transducer/init']();
        on.source = this;
        source._subscribe(this);
    }
    Transduce.prototype = {
        '@@transducer/init': function (acc) {
            this.acc = acc;
        },
        '@@transducer/step': function (acc, value) {
            this.on.emit(value);
            return value;
        },
        '@@transducer/result': function (acc) {
            this.on.end(acc);
        },
        emit: function (value) {
            this.acc = this.transformer['@@transducer/step'](this.acc, value);
        },
        end: function (err) {
            err ? this.transformer['@@transducer/result'](this.acc) : this.on.end(err);
        },
        setState: setStateThru
    };
    function Trigger(source, target) {
        this.target = target;
        this.source = null;
        target.trigger = this;
        source._subscribe(this);
    }
    Trigger.prototype = {
        emit: function (value) {
            this.target.triggerEmit(value);
        },
        end: noop,
        setState: setStateThru
    };
    function condTrue() {
        return true;
    }
    function condFalse() {
        return false;
    }
    function emitThru(value) {
        this.on.emit(value);
    }
    function endThru(err) {
        this.on.end(err);
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
                if (typeof options.count === 'number')
                    self.count = options.count;
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
    Asyncplify.value = function (value) {
        return new Asyncplify(Value, value);
    };
    function Value(value, on) {
        on.source = this;
        on.emit(value);
        on.end(null);
    }
    Value.prototype.setState = noop;
    Asyncplify.zip = function (options) {
        return new Asyncplify(Zip, options);
    };
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
    };
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
            this.state = CLOSED;
            if (err || !this.items.length) {
                this.on.setState(CLOSED);
                this.on.on.end(err);
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                this.source ? this.source.setState(state) : state === RUNNING && this.item._subscribe(this);
            }
        }
    };
    function AbsoluteTimeoutItem(context, item, dueTime) {
        this.context = context;
        this.dueTime = dueTime;
        this.handle = null;
        this.item = item;
    }
    AbsoluteTimeoutItem.prototype = {
        close: function () {
            clearTimeout(this.handle);
        },
        execute: function () {
            var err = null;
            try {
                this.item.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        },
        pause: function () {
            clearTimeout(this.handle);
            return this;
        },
        schedule: function () {
            this.handle = setTimeout(this.execute.bind(this), Math.max(this.dueTime - Date.now(), 0));
        }
    };
    function ImmediateTimeoutItem(context, item) {
        this.context = context;
        this.handle = null;
        this.item = item;
    }
    ImmediateTimeoutItem.prototype = {
        close: function () {
            clearImmediate(this.handle);
        },
        execute: function () {
            var err = null;
            try {
                this.item.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        },
        pause: function () {
            clearImmediate(this.handle);
            return this;
        },
        schedule: function () {
            this.handle = setImmediate(this.execute.bind(this));
        }
    };
    function RelativeTimeoutItem(context, item, delay) {
        this.context = context;
        this.delay = delay || 0;
        this.handle = null;
        this.item = item;
        this.scheduleTime = null;
        this.accurate = null;
    }
    RelativeTimeoutItem.prototype = {
        close: function () {
            clearTimeout(this.handle);
        },
        execute: function () {
            var err = null;
            try {
                this.item.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        },
        pause: function () {
            clearTimeout(this.handle);
            this.delay = Math.max(this.delay - (Date.now() - this.scheduleTime), 0);
            return this;
        },
        schedule: function () {
            this.scheduleTime = Date.now();
            this.accurate = process.hrtime();
            this.handle = setTimeout(this.execute.bind(this), this.delay);
        }
    };
    function ScheduleContext(factory) {
        this.factory = factory;
        this.items = [];
    }
    ScheduleContext.prototype = {
        cancel: function (item) {
            for (var i = 0; i < this.items.length; i++) {
                var r = this.items[i];
                if (r.item === item) {
                    this.items.splice(i, 0);
                    r.close();
                    break;
                }
            }
        },
        itemDone: noop,
        schedule: function (item) {
            var scheduleItem = this.factory(item);
            this.items.push(scheduleItem);
            scheduleItem.schedule();
        },
        setState: function (state) {
            var i;
            switch (state) {
            case CLOSED:
                for (i = 0; i < this.items.length; i++) {
                    this.items[i].close();
                }
                this.items.length = 0;
                break;
            case RUNNING:
                for (i = 0; i < this.items.length; i++) {
                    this.items[i].schedule();
                }
                break;
            case PAUSED:
                for (i = 0; i < this.items.length; i++) {
                    this.items[i] = this.items[i].pause();
                }
                break;
            }
        }
    };
    function immediateFactory(item) {
        return item.dueTime && item.dueTime > Date.now() ? new AbsoluteTimeoutItem(this, item, item.dueTime) : item.delay && item.delay > 0 ? new RelativeTimeoutItem(this, item, item.delay) : new ImmediateTimeoutItem(this, item);
    }
    function syncFactory(item) {
        return item.dueTime && item.dueTime > Date.now() ? new AbsoluteTimeoutItem(this, item, item.dueTime) : item.delay && item.delay > 0 ? new RelativeTimeoutItem(this, item, item.delay) : new SyncItem(this, item);
    }
    var immediateOrTimeoutFactory = typeof setImmediate === 'function' && typeof clearImmediate === 'function' ? immediateFactory : timeoutFactory;
    function timeoutFactory(item) {
        return item.dueTime ? new AbsoluteTimeoutItem(this, item, item.dueTime) : new RelativeTimeoutItem(this, item, item.delay);
    }
    var schedulers = Asyncplify.schedulers = {
        immediate: function () {
            return new ScheduleContext(immediateOrTimeoutFactory);
        },
        sync: function () {
            return new ScheduleContext(syncFactory);
        },
        timeout: function () {
            return new ScheduleContext(timeoutFactory);
        }
    };
    function SyncItem(context, item) {
        this.context = context;
        this.item = item;
    }
    SyncItem.prototype = {
        close: noop,
        pause: function () {
            return this;
        },
        schedule: function () {
            var err = null;
            try {
                this.item.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        }
    };
}());
//# sourceMappingURL=asyncplify.js.map