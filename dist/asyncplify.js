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
        close: closeSinkSource,
        emit: emitThru,
        end: function (err) {
            this.source = null;
            if (err && this.sink) {
                var source = this.mapper(err);
                if (source && this.sink)
                    return source._subscribe(this);
            }
            if (this.sink) {
                this.sink.end(err);
                this.sink = null;
            }
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
                    if (err)
                        this.parent.close();
                }
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
        close: closeSinkSource,
        emit: function (value) {
            if (this.sink && this.cond(value))
                this.value++;
        },
        end: function (err) {
            this.source = null;
            if (this.sink && !err)
                this.sink.emit(this.value);
            if (this.sink)
                this.sink.end(err);
            this.sink = null;
        }
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
        var self = this;
        this.item = {
            action: function () {
                self.action();
            },
            delay: options && options.delay || typeof options === 'number' && options || 0
        };
        on.source = this;
        this.scheduler.itemDone = function (err) {
            self.scheduledItemDone(err);
        };
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
            this.sink = null;
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
            if (!this.hasValue && !err && this.sink)
                this.sink.emit(this.value);
            if (this.sink)
                this.sink.end(err);
            this.sink = null;
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
    function Expand(selector, on, source) {
        this.error = null;
        this.items = [];
        this.on = on;
        this.selector = selector;
        this.selectPending = false;
        this.source = null;
        this.state = RUNNING;
        this.value = undefined;
        on.source = this;
        source._subscribe(this);
    }
    Expand.prototype = {
        callEnd: function () {
            if (this.error || !this.source && !this.items.length && !this.selectPending) {
                if (this.error)
                    this.setState(CLOSED);
                this.state === CLOSED;
                this.on.end(this.error);
            }
        },
        do: function () {
            if (this.state !== RUNNING)
                return;
            this.doSelect();
            this.callEnd();
        },
        doSelect: function () {
            if (!this.selectPending)
                return;
            var value = this.value;
            this.value = undefined;
            this.selectPending = false;
            var source = this.selector(value);
            if (source) {
                var item = new ExpandItem(this);
                this.items.push(item);
                source._subscribe(item);
            }
        },
        emit: function (value) {
            this.on.emit(value);
            this.selectPending = true;
            this.value = value;
            if (this.state === RUNNING)
                this.doSelect();
        },
        end: function (err) {
            this.source = null;
            this.error = this.error || err;
            this.callEnd();
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                if (this.source)
                    this.source.setState(state);
                for (var i = this.items.length - 1; i > -1 && this.state === state; i--) {
                    this.items[i].setState(state);
                }
                this.doSelect();
            }
        }
    };
    function ExpandItem(on) {
        this.on = on;
        this.source = null;
    }
    ExpandItem.prototype = {
        emit: emitThru,
        end: function (err) {
            removeItem(this.on.items, this);
            this.on.error = this.on.error || err;
            this.on.callEnd();
        },
        setState: setStateThru
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
        close: closeSinkSource,
        emit: function (value) {
            if (this.cond(value) && this.sink)
                this.sink.emit(value);
        },
        end: endSinkSource
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
            if (this.source) {
                this.source.close();
                this.source = null;
                this.registerProcessEnd(false);
                this.action();
            }
            this.sink = null;
        },
        emit: function (value) {
            if (this.sink)
                this.sink.emit(value);
        },
        end: function (err) {
            this.source = null;
            this.registerProcessEnd(false);
            this.action();
            if (this.sink)
                this.sink.end(err);
            this.sink = null;
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
    function FlatMap(options, on, source) {
        this.isPaused = false;
        this.items = [];
        this.mapper = options.mapper || options;
        this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
        this.on = on;
        this.state = RUNNING;
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
            } else if (this.source && this.maxConcurrency && count === this.maxConcurrency && this.isPaused) {
                this.isPaused = false;
                if (this.state === RUNNING)
                    this.source.setState(RUNNING);
            }
        },
        emit: function (v) {
            var item = this.mapper(v);
            if (item) {
                var flatMapItem = new FlatMapItem(this);
                this.items.push(flatMapItem);
                if (this.maxConcurrency && this.items.length >= this.maxConcurrency && !this.isPaused) {
                    this.isPaused = true;
                    this.source.setState(PAUSED);
                }
                item._subscribe(flatMapItem);
            }
        },
        end: function (err) {
            this.source = null;
            if (err)
                this.setState(CLOSED);
            if (err || !this.items.length)
                this.on.end(err);
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                if (this.source && !this.isPaused)
                    this.source.setState(state);
                for (var i = 0; i < this.items.length && this.state === state; i++) {
                    this.items[i].setState(state);
                }
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
        this.called = false;
        this.sink = sink;
        this.sink.source = this;
        var self = this;
        function callback(err, value) {
            if (!self.called) {
                self.called = true;
                if (self.sink && !err)
                    self.sink.emit(value);
                if (self.sink)
                    self.sink.end(err);
                self.sink = null;
            }
        }
        try {
            options[0].apply(null, options[1].concat([callback]));
        } catch (ex) {
            this.called = true;
            if (this.sink)
                this.sink.end(ex);
            this.sink = null;
        }
    }
    FromNode.prototype.close = closeSink;
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
    function IgnoreElements(_, sink, source) {
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    IgnoreElements.prototype = {
        close: closeSinkSource,
        emit: noop,
        end: endSinkSource
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
        var self = this;
        this.i = 0;
        this.item = {
            action: function () {
                self.action();
            },
            delay: options && options.delay || typeof options === 'number' && options || 0,
            error: function (err) {
                self.error(err);
            }
        };
        this.schedulerContext = (options && options.scheduler || schedulers.timeout)();
        this.sink = sink;
        this.sink.source = this;
        this.schedulerContext.schedule(this.item);
    }
    Interval.prototype = {
        action: function () {
            if (this.sink) {
                this.sink.emit(this.i++);
                if (this.schedulerContext)
                    this.schedulerContext.schedule(this.item);
            }
        },
        close: function () {
            this.sink = null;
            this.closeSchedulerContext();
        },
        closeSchedulerContext: closeSchedulerContext,
        endSink: endSink,
        error: function (err) {
            this.closeSchedulerContext();
            this.endSink(err);
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
    RangeOp.prototype.close = closeSink;
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
        return new Asyncplify(count ? Take : Empty, count, this);
    };
    function Take(count, sink, source) {
        this.count = count;
        this.sink = sink;
        this.sink.source = this;
        this.source = null;
        source._subscribe(this);
    }
    Take.prototype = {
        close: closeSinkSource,
        emit: function (value) {
            if (this.count-- && this.sink) {
                this.sink.emit(value);
                if (!this.count) {
                    var source = this.source;
                    var sink = this.sink;
                    this.source = null;
                    this.sink = null;
                    if (source)
                        source.close();
                    if (sink)
                        sink.end(null);
                }
            }
        },
        end: endSinkSource
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
            this.sink.end(err);
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
        close: closeSinkSource,
        emit: function (value) {
            if (this.sink && this.cond(value) && this.sink)
                this.sink.emit(value);
            else if (this.sink) {
                var sink = this.sink;
                var source = this.source;
                this.sink = null;
                this.source = null;
                if (source)
                    source.close();
                if (sink)
                    sink.end(null);
                ;
            }
        },
        end: endSinkSource
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
        if (this.subscribable) {
            this.subscribable._subscribe(this);
            this.subscribable = null;
        }
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
            this.sink = this.scheduler = this.source = null;
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
            var sink = this.sink;
            this.sink = null;
            if (sink)
                sink.end(err);
        },
        error: function (err) {
            this.scheduler.close();
            this.scheduler = null;
            if (this.source)
                this.source.close();
            this.source = null;
            if (this.sink)
                this.sink.end(err);
            this.sink = null;
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
            var sink = this.sink;
            this.sink = NoopSink.instance;
            sink.end(err);
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
            this.closeSource();
            this.target = null;
        },
        closeSource: closeSource,
        emit: function (value) {
            if (this.target)
                this.target.triggerEmit(value);
        },
        end: noop
    };
    function NoopSink() {
    }
    NoopSink.prototype = {
        close: noop,
        emit: noop,
        end: noop
    };
    NoopSink.instance = new NoopSink();
    function closeSchedulerContext() {
        var schedulerContext = this.schedulerContext;
        if (schedulerContext) {
            this.schedulerContext = null;
            schedulerContext.close();
        }
    }
    function closeSource() {
        var source = this.source;
        if (source) {
            this.source = null;
            source.close();
        }
    }
    function closeSink() {
        this.sink = null;
    }
    function closeSinkSource() {
        this.sink = null;
        if (this.source) {
            this.source.close();
            this.source = null;
        }
    }
    function condTrue() {
        return true;
    }
    function condFalse() {
        return false;
    }
    function emitThru(value) {
        if (this.sink)
            this.sink.emit(value);
    }
    function endSink(err) {
        var sink = this.sink;
        if (sink) {
            this.sink = null;
            sink.end(err);
        }
    }
    function endThru() {
        throw new Error('Deprecated');
    }
    function endSinkSource(err) {
        this.source = null;
        this.endSink(err);
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
    function Value(value, sink) {
        this.sink = sink;
        this.sink.source = this;
        this.sink.emit(value);
        if (this.sink)
            this.sink.end(null);
    }
    Value.prototype.close = closeSink;
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
                        this.parent.closeSubscriptions();
                        var sink = this.parent.sink;
                        this.parent.sink = null;
                        if (sink)
                            sink.end(null);
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
        execute: schedulerExecute,
        schedule: function () {
            var self = this;
            this.handle = setTimeout(function () {
                self.execute();
            }, Math.max(this.dueTime - Date.now(), 0));
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
        execute: schedulerExecute,
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
        this.handle = null;
        this.item = item;
    }
    RelativeTimeoutItem.prototype = {
        close: function () {
            clearTimeout(this.handle);
        },
        execute: schedulerExecute,
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
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].close();
            }
            this.items.length = 0;
        },
        schedule: function (item) {
            var scheduleItem = this.factory(item);
            this.items.push(scheduleItem);
            scheduleItem.schedule();
        }
    };
    function schedulerExecute() {
        removeItem(this.context.items, this);
        try {
            this.item.action();
        } catch (ex) {
            this.item.error(ex);
        }
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
        this.item = item;
    }
    SyncItem.prototype = {
        close: noop,
        schedule: schedulerExecute
    };
}());
//# sourceMappingURL=asyncplify.js.map