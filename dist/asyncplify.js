(function () {
    'use strict';
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
    function Catch(options, sink, source) {
        this.i = 0;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.sources = null;
        if (typeof options === 'function')
            this.mapper = options;
        else
            this.sources = Array.isArray(options) ? options : [];
        source._subscribe(this);
    }
    Catch.prototype = {
        close: function () {
            this.mapper = noop;
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            this.sink.emit(value);
        },
        end: function (err) {
            this.source = null;
            if (err) {
                var source = this.mapper(err);
                if (source && this.sink)
                    return source._subscribe(this);
            }
            this.sink.end(err);
            this.sink = NoopSink.instance;
        },
        mapper: function () {
            return this.i < this.sources.length && this.sources[this.i++];
        }
    };
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
        for (i = 0; i < items.length; i++)
            this.subscriptions.push(new CombineLatestItem(items[i], this, i));
        if (!items.length)
            this.sink.end(null);
    }
    CombineLatest.prototype.close = function () {
        this.sink = NoopSink.instance;
        for (var i = 0; i < this.subscriptions.length; i++)
            this.subscriptions[i].close();
        this.subscriptions.length = 0;
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
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (v) {
            this.parent.values[this.index] = v;
            if (!this.hasValue) {
                this.hasValue = true;
                this.parent.missingValuesCount--;
            }
            if (this.parent.missingValuesCount <= 0) {
                var array = this.parent.values.slice();
                this.parent.sink.emit(this.parent.mapper ? this.parent.mapper.apply(null, array) : array);
            }
        },
        end: function (err) {
            this.source = null;
            this.parent.closableCount--;
            if (err || !this.parent.closableCount) {
                this.parent.sink.end(err);
                if (err)
                    this.parent.close();
            }
        }
    };
    Asyncplify.prototype.count = function (cond) {
        return new Asyncplify(Count, cond, this);
    };
    function Count(cond, sink, source) {
        this.cond = cond || condTrue;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.value = 0;
        source._subscribe(this);
    }
    Count.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            if (this.cond(value))
                this.value++;
        },
        end: function (err) {
            this.source = null;
            if (!err)
                this.sink.emit(this.value);
            this.sink.end(err);
            this.sink = NoopSink.instance;
        }
    };
    Asyncplify.prototype.debounce = function (options) {
        return new Asyncplify(Debounce, options, this);
    };
    function Debounce(options, sink, source) {
        this.delay = options && options.delay || typeof options === 'number' && options || 0;
        this.itemPending = false;
        this.scheduler = (options && options.scheduler || schedulers.timeout)();
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.value = undefined;
        source._subscribe(this);
    }
    Debounce.prototype = {
        action: function () {
            var v = this.value;
            this.itemPending = false;
            this.value = undefined;
            this.sink.emit(v);
            if (!this.source) {
                if (this.scheduler)
                    this.scheduler.close();
                this.scheduler = null;
                this.sink.end(null);
                this.sink = NoopSink.instance;
            }
        },
        close: function () {
            if (this.source)
                this.source.close();
            if (this.scheduler)
                this.scheduler.close();
            this.source = this.scheduler = this.value = null;
            this.sink = NoopSink.instance;
        },
        emit: function (value) {
            this.itemPending = true;
            this.value = value;
            if (this.scheduler) {
                this.scheduler.close();
                this.scheduler.schedule(this);
            }
        },
        end: function (err) {
            this.source = null;
            debugger;
            if (err || !this.itemPending) {
                if (this.scheduler)
                    this.scheduler.close();
                this.scheduler = null;
                this.value = undefined;
                this.sink.end(err);
                this.sink = NoopSink.instance;
            }
        }
    };
    Asyncplify.prototype.defaultIfEmpty = function (value) {
        return new Asyncplify(DefaultIfEmpty, value, this);
    };
    function DefaultIfEmpty(value, sink, source) {
        this.hasValue = false;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.value = value;
        source._subscribe(this);
    }
    DefaultIfEmpty.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            this.hasValue = true;
            if (this.sink)
                this.sink.emit(value);
        },
        end: function (err) {
            this.source = null;
            if (!this.hasValue && !err)
                this.sink.emit(this.value);
            this.sink.end(err);
            this.sink = NoopSink.instance;
        }
    };
    Asyncplify.empty = function () {
        return new Asyncplify(Empty);
    };
    function Empty(_, sink) {
        sink.source = this;
        sink.end(null);
    }
    Empty.prototype.close = noop;
    Asyncplify.prototype.expand = function (selector) {
        return new Asyncplify(Expand, selector, this);
    };
    function Expand(mapper, sink, source) {
        this.error = null;
        this.items = [];
        this.mapper = mapper || identity;
        this.selectPending = false;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.value = undefined;
        source._subscribe(this);
    }
    Expand.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.mapper = noop;
            this.source = null;
            this.sink = NoopSink.instance;
        },
        emit: function (value) {
            this.sink.emit(value);
            var source = this.mapper(value);
            if (source) {
                var item = new ExpandItem(this);
                this.items.push(item);
                source._subscribe(item);
            }
        },
        end: function (err) {
            this.source = null;
            if (err) {
                for (var i = 0; i < this.items.length; i++)
                    this.items[i].close();
                this.items.length = 0;
            }
            if (!this.items.length) {
                this.mapper = noop;
                this.sink.end(err);
            }
        }
    };
    function ExpandItem(parent) {
        this.parent = parent;
        this.source = null;
    }
    ExpandItem.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (v) {
            this.parent.emit(v);
        },
        end: function (err) {
            this.source = null;
            removeItem(this.parent.items, this);
            if (err) {
                for (var i = 0; i < this.parent.items.length; i++)
                    this.parent.items[i].close();
                this.parent.items.length = 0;
            }
            if (!this.parent.items.length && !this.source) {
                this.parent.mapper = noop;
                this.parent.sink.end(err);
            }
        }
    };
    if (typeof module !== 'undefined') {
        module.exports = Asyncplify;
    } else if (typeof window !== 'undefined') {
        window.Asyncplify = window.asyncplify = Asyncplify;
    }
    Asyncplify.prototype.filter = function (cond) {
        if (typeof cond === 'function')
            return new Asyncplify(Filter, cond, this);
        if (cond === false)
            return new Asyncplify(Filter, condFalse, this);
        return this;
    };
    function Filter(cond, sink, source) {
        this.cond = cond;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Filter.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            if (this.cond(value))
                this.sink.emit(value);
        },
        end: function (err) {
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.finally = function (action) {
        return action ? new Asyncplify(Finally, action, this) : this;
    };
    function Finally(action, sink, source) {
        this.action = action;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.registerProcessEnd(true);
        source._subscribe(this);
    }
    Finally.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source) {
                this.source.close();
                this.source = null;
                this.registerProcessEnd(false);
                this.action();
            }
        },
        emit: function (value) {
            this.sink.emit(value);
        },
        end: function (err) {
            this.source = null;
            this.registerProcessEnd(false);
            this.action();
            this.sink.end(err);
        },
        registerProcessEnd: function (register) {
            if (typeof process === 'object') {
                var n = register ? 'on' : 'removeListener';
                process[n]('SIGINT', this.action);
                process[n]('SIGQUIT', this.action);
                process[n]('SIGTERM', this.action);
            }
        }
    };
    Asyncplify.prototype.flatMap = function (options) {
        return new Asyncplify(FlatMap, options, this);
    };
    function FlatMap(options, sink, source) {
        this.isSubscribing = false;
        this.mapper = options.mapper || options || identity;
        this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.sources = [];
        this.subscriptions = [];
        source._subscribe(this);
    }
    FlatMap.prototype = {
        childEnd: function (err, item) {
            removeItem(this.subscriptions, item);
            this.subscribe(err);
        },
        close: function () {
            if (this.source)
                this.source.close();
            for (var i = 0; i < this.subscriptions.length; i++)
                this.subscriptions[i].close();
            this.mapper = noop;
            this.sink = NoopSink.instance;
            this.source = null;
            this.sources.length = 0;
            this.subscriptions.length = 0;
        },
        emit: function (v) {
            var item = this.mapper(v);
            if (item) {
                this.sources.push(item);
                this.subscribe(null);
            }
        },
        end: function (err) {
            this.source = null;
            this.subscribe(err);
        },
        subscribe: function (err) {
            var sink = this.sink;
            if (err) {
                this.close();
                sink.end(err);
            } else if (!this.isSubscribing) {
                this.isSubscribing = true;
                while (this.sources.length && (this.maxConcurrency < 1 || (this.source ? 1 : 0) + this.subscriptions.length < this.maxConcurrency)) {
                    var item = new FlatMapItem(this);
                    this.subscriptions.push(item);
                    this.sources.shift()._subscribe(item);
                }
                this.isSubscribing = false;
                if (!this.sources.length && !this.subscriptions.length && !this.source) {
                    this.mapper = noop;
                    this.sink = NoopSink.instance;
                    sink.end(null);
                }
            }
        }
    };
    function FlatMapItem(parent) {
        this.parent = parent;
        this.source = null;
    }
    FlatMapItem.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (v) {
            this.parent.sink.emit(v);
        },
        end: function (err) {
            this.parent.childEnd(err, this);
        }
    };
    Asyncplify.prototype.flatMapLatest = function (options) {
        return new Asyncplify(FlatMapLatest, options, this);
    };
    function FlatMapLatest(options, sink, source) {
        this.mapper = options || identity;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.subscription = null;
        source._subscribe(this);
    }
    FlatMapLatest.prototype = {
        childEnd: function (err, item) {
            this.subscription = null;
            if (err && this.source) {
                this.source.close();
                this.source = null;
                this.mapper = noop;
            }
            if (err || !this.source)
                this.sink.end(err);
        },
        close: function () {
            if (this.source)
                this.source.close();
            if (this.subscription)
                this.subscription.close();
            this.source = this.subscription = null;
        },
        emit: function (v) {
            var item = this.mapper(v);
            if (item) {
                if (this.subscription)
                    this.subscription.close();
                this.subscription = new FlatMapItem(this);
                item._subscribe(this.subscription);
            }
        },
        end: function (err) {
            this.mapper = noop;
            this.source = null;
            if (err && this.subscription) {
                this.subscription.close();
                this.subscription = null;
            }
            if (err || !this.subscription)
                this.sink.end(err);
        }
    };
    Asyncplify.fromArray = function (array) {
        return new Asyncplify(FromArray, array);
    };
    function FromArray(array, sink) {
        this.sink = sink;
        this.sink.source = this;
        for (var i = 0; i < array.length && this.sink; i++)
            this.sink.emit(array[i]);
        if (this.sink)
            this.sink.end(null);
    }
    FromArray.prototype.close = function () {
        this.sink = null;
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
    function FromNode(options, sink) {
        this.sink = sink;
        this.sink.source = this;
        var self = this;
        function callback(err, value) {
            self.sink.emit(value);
            self.sink.end(err);
        }
        try {
            options[0].apply(null, options[1].concat([callback]));
        } catch (ex) {
            this.sink.end(ex);
        }
    }
    FromNode.prototype.close = function () {
        this.sink = NoopSink.instance;
    };
    Asyncplify.fromPromise = function (promise, cb) {
        return new Asyncplify(FromPromise, promise);
    };
    function FromPromise(promise, sink) {
        this.sink = sink;
        this.sink.source = this;
        var self = this;
        function resolve(v) {
            self.sink.emit(v);
            self.sink.end(null);
        }
        function rejected(err) {
            self.sink.end(err);
        }
        promise.then(resolve, rejected);
    }
    FromPromise.prototype.close = function () {
        this.sink = NoopSink.instance;
    };
    Asyncplify.fromRx = function (obs) {
        return new Asyncplify(FromRx, obs);
    };
    function FromRx(obs, sink) {
        sink.source = this;
        function next(value) {
            sink.emit(value);
        }
        function error(err) {
            sink.end(err);
        }
        function completed() {
            sink.end(null);
        }
        this.subscription = obs.subscribe(next, error, completed);
    }
    FromRx.prototype.close = function () {
        this.subscription.dispose();
    };
    Asyncplify.prototype.groupBy = function (options) {
        return new Asyncplify(GroupBy, options, this);
    };
    function GroupBy(options, sink, source) {
        this.elementSelector = options && options.elementSelector || identity;
        this.keySelector = typeof options === 'function' ? options : options && options.keySelector || identity;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.store = options && options.store || {};
        source._subscribe(this);
    }
    GroupBy.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (v) {
            var key = this.keySelector(v);
            var group = this.store[key];
            if (!group) {
                group = this.store[key] = Asyncplify.subject();
                group.key = key;
                this.sink.emit(group);
            }
            group.emit(this.elementSelector(v));
        },
        end: function (err) {
            for (var k in this.store) {
                this.store[k].end(null);
            }
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.ignoreElements = function () {
        return new Asyncplify(IgnoreElements, null, this);
    };
    function IgnoreElements(_, sink, source) {
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    IgnoreElements.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: noop,
        end: function (err) {
            this.source = null;
            this.sink.end(err);
            this.sink = NoopSink.instance;
        }
    };
    Asyncplify.infinite = function () {
        return new Asyncplify(Infinite);
    };
    function Infinite(_, sink) {
        this.sink = sink;
        this.sink.source = this;
        while (this.sink)
            this.sink.emit();
    }
    Infinite.prototype.close = function () {
        this.sink = null;
    };
    Asyncplify.interval = function (options) {
        return new Asyncplify(Interval, options);
    };
    function Interval(options, sink) {
        this.i = 0;
        this.delay = options && options.delay || typeof options === 'number' && options || 0;
        this.scheduler = (options && options.scheduler || schedulers.timeout)();
        this.sink = sink;
        this.sink.source = this;
        this.scheduler.schedule(this);
    }
    Interval.prototype = {
        action: function () {
            this.sink.emit(this.i++);
            if (this.scheduler)
                this.scheduler.schedule(this);
        },
        close: function () {
            this.sink = NoopSink.instance;
            if (this.scheduler)
                this.scheduler.close();
            this.scheduler = null;
        }
    };
    Asyncplify.prototype.last = function (cond) {
        return new Asyncplify(Last, cond, this);
    };
    function Last(cond, sink, source) {
        this.cond = cond || condTrue;
        this.hasItem = false;
        this.item = null;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Last.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.sink = NoopSink.instance;
            this.source = null;
        },
        emit: function (value) {
            if (this.cond(value)) {
                this.item = value;
                this.hasItem = true;
            }
        },
        end: function (err) {
            this.source = null;
            if (!err && this.hasItem)
                this.sink.emit(this.item);
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.map = function (mapper) {
        return mapper ? new Asyncplify(Map, mapper, this) : this;
    };
    function Map(mapper, sink, source) {
        this.mapper = mapper;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Map.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.mapper = noop;
            this.source = null;
        },
        emit: function (value) {
            this.sink.emit(this.mapper(value));
        },
        end: function (err) {
            this.mapper = noop;
            this.source = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        }
    };
    Asyncplify.merge = function (options) {
        return new Asyncplify(Merge, options);
    };
    function Merge(options, sink) {
        this.concurrency = 0;
        this.index = 0;
        this.items = options.items || options || [];
        this.maxConcurrency = options.maxConcurrency || 0;
        this.sink = sink;
        this.sink.source = this;
        this.subscriptions = [];
        while (this.index < this.items.length && (this.maxConcurrency < 1 || this.concurrency < this.maxConcurrency))
            new MergeItem(this.items[this.index++], this);
        if (!this.items.length)
            this.sink.end(null);
    }
    Merge.prototype.close = function () {
        this.sink = NoopSink.instance;
        for (var i = 0; i < this.subscriptions.length; i++)
            this.subscriptions[i].close();
        this.subscriptions.length = 0;
    };
    function MergeItem(item, parent) {
        this.parent = parent;
        this.source = null;
        parent.concurrency++;
        parent.subscriptions.push(this);
        item._subscribe(this);
    }
    MergeItem.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (v) {
            this.parent.sink.emit(v);
        },
        end: function (err) {
            if (this.source) {
                this.source = null;
                this.parent.concurrency--;
                removeItem(this.parent.subscriptions, this);
                if (err || this.parent.index >= this.parent.items.length) {
                    var sink = this.parent.sink;
                    this.parent.close();
                    sink.end(err);
                } else if (this.parent.maxConcurrency < 1 || this.parent.concurrency < this.parent.maxConcurrency) {
                    new MergeItem(this.parent.items[this.parent.index++], this.parent);
                }
            }
        }
    };
    Asyncplify.never = function () {
        return new Asyncplify(Never);
    };
    function Never(_, sink) {
        sink.source = this;
    }
    Never.prototype.close = noop;
    Asyncplify.prototype.observeOn = function (options) {
        return new Asyncplify(ObserveOn, options, this);
    };
    function ObserveOn(options, sink, source) {
        this.scheduler = (typeof options === 'function' ? options : options && options.scheduler || schedulers.immediate)();
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    ObserveOn.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            if (this.scheduler)
                this.scheduler.close();
            this.source = null;
        },
        emit: function (v) {
            this.scheduler.schedule(new ObserveOnItem(v, true, this));
        },
        end: function (err) {
            this.scheduler.schedule(new ObserveOnItem(err, false, this));
        }
    };
    function ObserveOnItem(value, isEmit, parent) {
        this.isEmit = isEmit;
        this.parent = parent;
        this.value = value;
    }
    ObserveOnItem.prototype = {
        action: function () {
            this.isEmit ? this.parent.sink.emit(this.value) : this.parent.sink.end(this.value);
        },
        error: function (err) {
            var sink = this.parent.sink;
            this.parent.close();
            sink.end(err);
        },
        delay: 0
    };
    Asyncplify.prototype.pipe = function (func) {
        return func(this);
    };
    Asyncplify.range = function (options) {
        return new Asyncplify(RangeOp, options);
    };
    function RangeOp(options, sink) {
        var i = options && options.start || 0;
        var end = typeof options === 'number' ? options : options && options.end || 0;
        var step = options && options.step || 1;
        this.sink = sink;
        this.sink.source = this;
        for (; i < end && this.sink; i += step)
            this.sink.emit(i);
        if (this.sink)
            this.sink.end(null);
    }
    RangeOp.prototype.close = function () {
        this.sink = null;
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
    Asyncplify.prototype.scan = function (options) {
        return new Asyncplify(Scan, options, this);
    };
    function scanIdentity(acc, v) {
        return (acc || 0) + (v || 0);
    }
    function Scan(options, sink, source) {
        this.acc = options && options.initial || 0;
        this.mapper = typeof options === 'function' ? options : options && options.mapper || scanIdentity;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Scan.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            this.acc = this.mapper(this.acc, value);
            this.sink.emit(this.acc);
        },
        end: function (err) {
            this.mapper = null;
            this.source = null;
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.share = function (options) {
        var r = new Asyncplify(Share, null, this);
        r.emit = shareEmit;
        r.end = shareEnd;
        r._scheduler = options && options.scheduler && options.scheduler() || schedulers.sync();
        r._refs = [];
        return r;
    };
    function shareEmit(value) {
        for (var i = 0; i < this._refs.length; i++)
            this._refs[i].emit(value);
    }
    function shareEnd(err) {
        var array = this._refs;
        this._refs = [];
        for (var i = 0; i < array.length; i++)
            array[i].end(err);
    }
    function Share(_, sink, source, parent) {
        this.sink = sink;
        this.sink.source = this;
        this.parent = parent;
        parent._refs.push(this);
        var self = this;
        if (parent._refs.length === 1) {
            parent._scheduler.schedule({
                action: function () {
                    source._subscribe(parent);
                },
                error: function (err) {
                    self.sink.end(err);
                }
            });
        }
    }
    Share.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            removeItem(this.parent._refs, this);
            if (!this.parent._refs.length) {
                this.parent._scheduler.close();
                if (this.parent.source)
                    this.parent.source.close();
                this.parent.source = null;
            }
        },
        emit: function (value) {
            this.sink.emit(value);
        },
        end: function (err) {
            this.parent.source = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        }
    };
    Asyncplify.prototype.skip = function (count) {
        return typeof count !== 'number' || count <= 0 ? this : new Asyncplify(Skip, count, this);
    };
    function Skip(count, sink, source) {
        this.count = count;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Skip.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            if (this.count > 0) {
                this.count--;
            } else {
                this.sink.emit(value);
            }
        },
        end: function (err) {
            this.source = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        }
    };
    Asyncplify.prototype.skipLast = function (count) {
        return new Asyncplify(SkipLast, typeof count === 'number' ? count : 1, this);
    };
    function SkipLast(count, sink, source) {
        this.count = count;
        this.items = [];
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    SkipLast.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.items.length = 0;
            this.source = null;
        },
        emit: function (value) {
            this.source = null;
            this.items.push(value);
            this.items.length > this.count && this.sink.emit(this.items.splice(0, 1)[0]);
        },
        end: function (err) {
            this.source = null;
            this.items.length = 0;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        }
    };
    Asyncplify.prototype.skipUntil = function (trigger) {
        return new Asyncplify(SkipUntil, trigger, this);
    };
    function SkipUntil(trigger, sink, source) {
        this.can = false;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.trigger = null;
        new Trigger(trigger, this);
        source._subscribe(this);
    }
    SkipUntil.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.trigger)
                this.trigger.close();
            if (this.source)
                this.source.close();
            this.trigger = this.source = null;
        },
        emit: function (value) {
            if (this.can)
                this.sink.emit(value);
        },
        end: function (err) {
            if (this.trigger)
                this.trigger.close();
            this.trigger = this.source = null;
            var sink = this.sink;
            this.sink = null;
            sink.end(err);
        },
        triggerEmit: function () {
            this.trigger.close();
            this.trigger = null;
            this.can = true;
        }
    };
    Asyncplify.prototype.skipWhile = function (cond) {
        return new Asyncplify(SkipWhile, cond, this);
    };
    function SkipWhile(cond, sink, source) {
        this.can = false;
        this.cond = cond;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    SkipWhile.prototype = {
        close: function () {
            this.cond = condTrue;
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            if (this.can || !this.cond(value)) {
                this.can = true;
                this.sink.emit(value);
            }
        },
        end: function (err) {
            this.cond = condTrue;
            this.source = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        }
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
        for (var i = 0; i < this.subjects.length; i++)
            this.subjects[i].emit(value);
    }
    function subjectEnd(err) {
        var subjects = this.subjects;
        this.subjects = [];
        for (var i = 0; i < subjects.length; i++)
            subjects[i].end(err);
    }
    function Subject(_, sink, parent) {
        this.parent = parent;
        this.sink = sink;
        this.sink.source = this;
        parent.subjects.push(this);
    }
    Subject.prototype = {
        close: function () {
            if (this.parent)
                removeItem(this.parent.subjects, this);
            this.parent = null;
        },
        emit: function (value) {
            this.sink.emit(value);
        },
        end: function (err) {
            this.parent = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        }
    };
    Asyncplify.prototype.subscribe = function (options) {
        return new Subscribe(options, this);
    };
    function Subscribe(options, source) {
        if (options && options.emit)
            this.emit = options.emit;
        else if (typeof options === 'function')
            this.emit = options;
        if (options && options.end)
            this.end = options.end;
        this.source = null;
        source._subscribe(this);
    }
    Subscribe.prototype = {
        close: function () {
            if (this.source) {
                this.source.close();
                this.source = null;
            }
        },
        emit: noop,
        end: noop
    };
    Asyncplify.prototype.subscribeOn = function (options) {
        return new Asyncplify(SubscribeOn, options, this);
    };
    function SubscribeOn(options, sink, source) {
        this.origin = source;
        this.sink = sink;
        this.sink.source = this;
        this.scheduler = (typeof options === 'function' ? options : options && options.scheduler || schedulers.immediate)();
        this.source = null;
        this.scheduler.schedule(this);
    }
    SubscribeOn.prototype = {
        action: function () {
            this.scheduler.close();
            this.scheduler = null;
            this.origin._subscribe(this);
            this.origin = null;
        },
        close: function () {
            if (this.scheduler)
                this.scheduler.close();
            if (this.source)
                this.source.close();
            this.scheduler = this.source = this.origin = null;
        },
        emit: function (value) {
            this.sink.emit(value);
        },
        end: function (err) {
            this.source = null;
            this.sink.end(err);
        },
        error: function (err) {
            this.scheduler.close();
            this.source.close();
            this.scheduler = this.source = this.origin = null;
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.sum = function (mapper, source, cb) {
        return new Asyncplify(Sum, mapper || identity, this);
    };
    function Sum(mapper, sink, source) {
        this.hasValue = false;
        this.mapper = mapper;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.value = 0;
        source._subscribe(this);
    }
    Sum.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.source = this.sink = this.mapper = null;
        },
        emit: function (value) {
            this.value += this.mapper(value) || 0;
            this.hasValue = true;
        },
        end: function (err) {
            this.source = null;
            if (!err && this.hasValue && this.sink)
                this.sink.emit(this.value);
            if (this.sink)
                this.sink.end(err);
        }
    };
    Asyncplify.prototype.take = function (count) {
        return new Asyncplify(count > 0 ? Take : Empty, count, this);
    };
    function Take(count, sink, source) {
        this.count = count;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Take.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.sink = NoopSink.instance;
            this.source = null;
        },
        emit: function (value) {
            if (this.count--) {
                this.sink.emit(value);
                if (!this.count) {
                    this.source.close();
                    this.source = null;
                    this.sink.end(null);
                }
            }
        },
        end: function (err) {
            this.source = null;
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.takeUntil = function (trigger) {
        return new Asyncplify(TakeUntil, trigger, this);
    };
    function TakeUntil(trigger, sink, source) {
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.trigger = null;
        new Trigger(trigger, this);
        if (this.trigger)
            source._subscribe(this);
    }
    TakeUntil.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            if (this.trigger)
                this.trigger.close();
            this.source = this.trigger = null;
        },
        emit: function (value) {
            this.sink.emit(value);
        },
        end: function (err) {
            if (this.trigger)
                this.trigger.close();
            this.source = this.trigger = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
        },
        triggerEmit: function () {
            if (this.source)
                this.source.close();
            this.trigger.close();
            this.source = this.trigger = null;
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(null);
        }
    };
    Asyncplify.prototype.takeWhile = function (cond) {
        return new Asyncplify(TakeWhile, cond, this);
    };
    function TakeWhile(cond, sink, source) {
        this.cond = cond;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    TakeWhile.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.cond = noop;
            this.source = null;
            this.sink = NoopSink.instance;
        },
        emit: function (value) {
            if (this.cond(value)) {
                this.sink.emit(value);
            } else {
                this.source.close();
                this.source = null;
                this.cond = noop;
                this.sink.end(null);
            }
        },
        end: function (err) {
            this.source = null;
            this.cond = noop;
            this.sink.end(err);
        }
    };
    Asyncplify.prototype.tap = function (options) {
        return new Asyncplify(Tap, options, this);
    };
    function Tap(options, sink, source) {
        this._emit = options && options.emit || typeof options === 'function' && options || noop;
        this._end = options && options.end || noop;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        if (options && options.subscribe)
            options.subscribe({
                sink: sink,
                source: source
            });
        source._subscribe(this);
    }
    Tap.prototype = {
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            this._emit(value);
            this.sink.emit(value);
        },
        end: function (err) {
            this.source = null;
            this._end(err);
            this.sink.end(err);
        }
    };
    Asyncplify.throw = function (err, cb) {
        return new Asyncplify(Throw, err);
    };
    function Throw(err, sink) {
        sink.end(err);
    }
    Throw.prototype.close = noop;
    Asyncplify.prototype.timeout = function (options) {
        return new Asyncplify(Timeout, options, this);
    };
    function Timeout(options, sink, source) {
        this.delay = typeof options === 'number' ? options : options && options.delay || 0;
        this.dueTime = options instanceof Date ? options : options && options.dueTime;
        this.other = options instanceof Asyncplify ? options : options && options.other || Asyncplify.throw(new Error('Timeout'));
        this.scheduler = (options && options.scheduler || schedulers.timeout)();
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.subscribable = source;
        this.scheduler.schedule(this);
        if (this.subscribable)
            this.subscribable._subscribe(this);
        this.subscribable = null;
    }
    Timeout.prototype = {
        action: function () {
            this.scheduler.close();
            this.subscribable = this.scheduler = null;
            if (this.source)
                this.source.close();
            this.other._subscribe(this);
        },
        close: function () {
            if (this.source)
                this.source.close();
            if (this.scheduler)
                this.scheduler.close();
            this.scheduler = this.source = null;
            this.sink = NoopSink.instance;
        },
        emit: function (value) {
            if (this.scheduler)
                this.scheduler.close();
            this.scheduler = null;
            this.sink.emit(value);
        },
        end: function (err) {
            if (this.scheduler)
                this.scheduler.close();
            this.source = this.scheduler = null;
            this.sink.end(err);
            this.sink = NoopSink.instance;
        },
        error: function (err) {
            this.scheduler.close();
            if (this.source)
                this.source.close();
            this.source = this.scheduler = null;
            this.sink.end(err);
            this.sink = NoopSink.instance;
        }
    };
    Asyncplify.prototype.toArray = function (options, source, cb) {
        return new Asyncplify(ToArray, options, this);
    };
    function ToArray(options, sink, source) {
        this.array = [];
        this.emitEmpty = options && options.emitEmpty || false;
        this.hasEmit = false;
        this.sink = sink;
        this.sink.source = this;
        this.splitCond = null;
        this.splitLength = 0;
        this.source = null;
        this.trigger = null;
        var split = options && options.split || options;
        switch (typeof split) {
        case 'number':
            this.splitLength = split;
            this.emit = toArraySplitLength;
            break;
        case 'function':
            this.splitCond = split;
            this.emit = toArraySplitCond;
            break;
        case 'object':
            if (split instanceof Asyncplify)
                new Trigger(split, this);
            break;
        }
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
        close: function () {
            this.sink = NoopSink.instance;
            if (this.source)
                this.source.close();
            this.source = null;
        },
        emit: function (value) {
            this.array.push(value);
        },
        emitArray: function () {
            var a = this.array;
            this.array = [];
            this.hasEmit = true;
            this.sink.emit(a);
        },
        end: function (err) {
            this.source = null;
            if (!err && (this.array.length || !this.hasEmit && this.emitEmpty))
                this.sink.emit(this.array);
            if (this.trigger)
                this.trigger.close();
            this.trigger = null;
            this.sink.end(err);
        },
        triggerEmit: function () {
            if (this.array.length || this.emitEmpty)
                this.emitArray();
        }
    };
    Asyncplify.prototype.transduce = function (transformer, source, cb) {
        return new Asyncplify(Transduce, transformer, this);
    };
    function Transduce(transformer, sink, source) {
        this.acc = null;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        this.transformer = transformer(this);
        this.transformer['@@transducer/init']();
        source._subscribe(this);
    }
    Transduce.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.acc = null;
            this.source = null;
            this.transformer = null;
        },
        '@@transducer/init': function (acc) {
            this.acc = acc;
        },
        '@@transducer/step': function (acc, value) {
            this.sink.emit(value);
            return value;
        },
        '@@transducer/result': function (acc) {
            this.source = null;
            this.sink.end(acc);
        },
        emit: function (value) {
            this.acc = this.transformer['@@transducer/step'](this.acc, value);
        },
        end: function (err) {
            err ? this.transformer['@@transducer/result'](this.acc) : this.sink.end(err);
        }
    };
    function Trigger(source, target) {
        this.target = target;
        this.source = null;
        target.trigger = this;
        source._subscribe(this);
    }
    Trigger.prototype = {
        close: function () {
            if (this.source)
                this.source.close();
            this.source = this.target = null;
        },
        emit: function (value) {
            if (this.target)
                this.target.triggerEmit(value);
        },
        end: noop
    };
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
    function NoopSink() {
    }
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
    Asyncplify.value = function (value) {
        return new Asyncplify(Value, value);
    };
    function Value(value, sink) {
        this.sink = sink;
        this.sink.source = this;
        this.sink.emit(value);
        this.sink.end(null);
    }
    Value.prototype.close = function () {
        this.sink = NoopSink.instance;
    };
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
        if (!items.length)
            this.sink.end(null);
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
            if (this.source)
                this.source.close();
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
                    if (!s.items.length)
                        return;
                    array.push(s.items.splice(0, 1)[0]);
                }
                this.parent.sink.emit(this.parent.mapper ? this.parent.mapper.apply(null, array) : array);
                for (i = 0; i < subscriptions.length; i++) {
                    s = subscriptions[i];
                    if (!s.source && !s.items.length) {
                        this.parent.mapper = noop;
                        this.parent.closeSubscriptions();
                        this.parent.sink.end(null);
                        this.parent.sink = NoopSink.instance;
                        break;
                    }
                }
            }
        },
        end: function (err) {
            this.source = null;
            if (err || !this.items.length) {
                this.parent.mapper = noop;
                this.parent.sink.end(err);
                this.parent.sink = NoopSink.instance;
            }
        }
    };
    function AbsoluteTimeoutItem(context, item, dueTime) {
        this.context = context;
        this.dueTime = dueTime;
        this.execute = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
        this.handle = null;
        this.item = item;
    }
    AbsoluteTimeoutItem.prototype = {
        close: function () {
            clearTimeout(this.handle);
        },
        schedule: function () {
            var self = this;
            this.handle = setTimeout(function () {
                self.execute();
            }, Math.max(this.dueTime - Date.now(), 0));
        }
    };
    function ImmediateTimeoutItem(context, item) {
        this.context = context;
        this.execute = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
        this.handle = null;
        this.item = item;
    }
    ImmediateTimeoutItem.prototype = {
        close: function () {
            clearImmediate(this.handle);
        },
        schedule: function () {
            var self = this;
            this.handle = setImmediate(function () {
                self.execute();
            });
        }
    };
    function RelativeTimeoutItem(context, item, delay) {
        this.context = context;
        this.delay = delay || 0;
        this.execute = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
        this.handle = null;
        this.item = item;
    }
    RelativeTimeoutItem.prototype = {
        close: function () {
            clearTimeout(this.handle);
        },
        schedule: function () {
            var self = this;
            this.handle = setTimeout(function () {
                self.execute();
            }, this.delay);
        }
    };
    function ScheduleContext(factory) {
        this.factory = factory;
        this.items = [];
    }
    ScheduleContext.prototype = {
        close: function (item) {
            var i;
            if (item) {
                for (i = 0; i < this.items.length; i++)
                    if (this.items[i].item === item) {
                        this.items[i].close();
                        this.items.splice(i);
                        return;
                    }
            } else {
                for (i = 0; i < this.items.length; i++)
                    this.items[i].close();
                this.items.length = 0;
            }
        },
        schedule: function (item) {
            var scheduleItem = this.factory(item);
            this.items.push(scheduleItem);
            scheduleItem.schedule();
        }
    };
    function schedulerExecuteSafe() {
        removeItem(this.context.items, this);
        try {
            this.item.action();
        } catch (ex) {
            this.item.error(ex);
        }
    }
    function schedulerExecuteUnsafe() {
        removeItem(this.context.items, this);
        this.item.action();
    }
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
        this.schedule = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
        this.item = item;
    }
    SyncItem.prototype.close = noop;
}());
//# sourceMappingURL=asyncplify.js.map