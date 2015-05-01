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
    var RUNNING = 0;
    var PAUSED = 1;
    var CLOSED = 2;
    var LAST = undefined;
    var EMPTY = 0;
    var OPEN = 1;
    Asyncplify.continueState = {
        LAST: LAST,
        EMPTY: EMPTY,
        OPEN: OPEN
    };
    var EMPTYOBJ = {};
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
            this.cond() && this.value++;
        },
        end: function (err) {
            !err && this.on.emit(this.value);
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
            for (; this.i < this.array.length && this.state === RUNNING; this.i++) {
                this.on.emit(this.array[this.i]);
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
        this.err = null;
        this.on = on;
        this.state = RUNNING;
        this.step = 0;
        this.value = null;
        on.source = this;
        options[0].apply(options.self, options[1].concat(this.cb.bind(this)));
    }
    FromNode.prototype = {
        cb: function (err, value) {
            this.err = err;
            this.step = 1;
            this.value = value;
            this.state === RUNNING && this.do();
        },
        do: function () {
            if (this.step !== 0) {
                if (this.err) {
                    this.state = CLOSED;
                    this.on.end(this.err);
                    return;
                }
                if (this.step === 1) {
                    this.step = 2;
                    this.on.emit(this.value);
                }
                if (this.step === 2) {
                    this.state = CLOSED;
                    this.on.end(this.err);
                }
            }
        },
        setState: setState
    };
    Asyncplify.fromPromise = function (promise, cb) {
        return new Asyncplify(FromPromise, promise);
    };
    function FromPromise(promise, on) {
        this.on = on;
        this.p = promise;
        this.resolved = 0;
        this.state = RUNNING;
        this.value = null;
        on.source = this;
        promise.then(function (v) {
            this.resolved = 1;
            this.value = v;
            this.state === RUNNING && this.do();
        }, function (err) {
            this.resolved = 2;
            this.value = err;
            this.state === RUNNING && this.do();
        });
    }
    FromPromise.prototype = {
        do: function () {
            switch (this.resolved) {
            case 1:
                this.on.emit(this.value);
                this.on.end();
                break;
            case 2:
                this.state = CLOSED;
                this.on.end(this.value);
                break;
            }
        },
        setState: setState
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
    Asyncplify.interval = function (options) {
        return new Asyncplify(Interval, options);
    };
    function Interval(options, on) {
        this.scheduledItems = [];
        this.scheduler = options.scheduler || schedulers.timeout();
        this.on = on;
        this.state = RUNNING;
        this.item = {
            action: noop,
            delay: typeof options === 'number' ? options : options.delay || 0
        };
        on.source = this;
        this.scheduler.itemDone = this.scheduledItemDone.bind(this);
        this.scheduler.schedule(this.item);
    }
    Interval.prototype = {
        scheduledItemDone: function (err) {
            if (this.err) {
                this.on.end(err);
            } else {
                this.on.emit();
                this.state === RUNNING && this.scheduler.schedule(this.item);
            }
        },
        setState: function (state) {
            if (this.state !== state && this.state !== CLOSED) {
                this.state = state;
                if (state === RUNNING) {
                    !this.scheduledItems.length && this.scheduler.schedule(this.item);
                } else {
                    this.scheduler.setState(this, state);
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
        }
    };
    Asyncplify.never = function () {
        return new Asyncplify(Never);
    };
    function Never(_, on) {
        on.source = this;
    }
    Never.prototype.setState = noop;
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
        return new Subscribe(options || EMPTYOBJ, this);
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
        this._end = options && options.end || noop;
        this._setState = options && options.setState || noop;
        this.on = on;
        this.source = null;
        on.source = this;
        options && options.subscribe && options.subscribe({
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
            this._end(err);
            this.on.end(err);
        },
        setState: function (state) {
            this._setState(state);
            this.source.setState(state);
        }
    };
    Asyncplify.prototype.toArray = function (options, source, cb) {
        return new Asyncplify(ToArray, options || EMPTYOBJ, this);
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
    Asyncplify.value = function (value, cb) {
        return new Asyncplify(Value, value);
    };
    function Value(value, on) {
        this.on = on;
        this.state = RUNNING;
        on.source = this;
        on.emit(value);
        this.state === RUNNING && this.do();
    }
    Value.prototype = {
        do: function () {
            this.state = CLOSED;
            this.on.end(null);
        },
        setState: setState
    };
    Asyncplify.zip = function (options) {
        return new Asyncplify(Zip, options);
    };
    function Zip(options, on) {
        var items = options.items || options || [];
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
    };
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
                this.on.on.emit(array);
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
    function AbsoluteTimeoutItem(context, action, dueTime) {
        this.action = action;
        this.context = context;
        this.dueTime = dueTime;
        this.handle = null;
    }
    AbsoluteTimeoutItem.prototype = {
        cancel: function () {
            cancelTimeout(this.handle);
            return this;
        },
        close: function () {
            cancelTimeout(this.handle);
        },
        execute: function () {
            var err = null;
            try {
                this.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        },
        schedule: function () {
            this.handle = setTimeout(this.execute.bind(this), Math.max(this.dueTime - new Date(), 0));
        }
    };
    function NextTickItem(context, action) {
        this.action = action;
        this.canExecute = true;
        this.context = context;
    }
    NextTickItem.prototype = {
        cancel: function () {
            this.canExecute = false;
            return new NextTickItem(this.context, this.do);
        },
        close: function () {
            this.canExecute = false;
        },
        execute: function () {
            if (this.canExecute) {
                var err = null;
                try {
                    this.action();
                } catch (ex) {
                    err = ex;
                }
                this.context.itemDone(err);
            }
        },
        schedule: function () {
            process.nextTick(this.execute.bind(this));
        }
    };
    function RelativeTimeoutItem(context, action, delay) {
        this.action = action;
        this.context = context;
        this.delay = delay || 0;
        this.handle = null;
        this.scheduleTime = 0;
    }
    RelativeTimeoutItem.prototype = {
        cancel: function () {
            cancelTimeout(this.handle);
            this.delay = Math.max(this.delay - new Date().valueOf() - this.scheduleTime, 0);
            return this;
        },
        close: function () {
            cancelTimeout(this.handle);
        },
        execute: function () {
            var err = null;
            try {
                this.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        },
        schedule: function () {
            this.scheduleTime = new Date().valueOf();
            this.handle = setTimeout(this.execute.bind(this), this.delay);
        }
    };
    function ScheduleContext(factory) {
        this.factory = factory;
        this.items = [];
        this.itemDone = null;
    }
    ScheduleContext.prototype = {
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
                    this.items[i] = this.items[i].cancel();
                }
                break;
            }
        }
    };
    function immediateNextTickFactory(item) {
        return item.dueTime && item.dueTime > new Date() ? new AbsoluteTimeoutItem(this, item.action, item.dueTime) : item.delay && item.delay > 0 ? new RelativeTimeoutItem(this, item.action, item.delay) : new NextTickItem(this, item.action);
    }
    function syncFactory(item) {
        return item.dueTime && item.dueTime > new Date() ? new AbsoluteTimeoutItem(this, item.action, item.dueTime) : item.delay && item.delay > 0 ? new RelativeTimeoutItem(this, item.action, item.delay) : new SyncItem(this, item.action);
    }
    var immediateFactory = typeof process !== 'undefined' && process.nextTick ? immediateNextTickFactory : timeoutFactory;
    function timeoutFactory(item) {
        return item.dueTime ? new AbsoluteTimeoutItem(this, item.action, item.dueTime) : new RelativeTimeoutItem(this, item.action, item.delay);
    }
    var schedulers = Asyncplify.schedulers = {
        immediate: function () {
            return new ScheduleContext(immediateFactory);
        },
        sync: function () {
            return new ScheduleContext(syncFactory);
        },
        timeout: function () {
            return new ScheduleContext(timeoutFactory);
        }
    };
    function SyncItem(context, action) {
        this.action = action;
        this.context = context;
    }
    SyncItem.prototype = {
        cancel: function () {
            return this;
        },
        close: noop,
        schedule: function () {
            var err = null;
            try {
                this.action();
            } catch (ex) {
                err = ex;
            }
            this.context.itemDone(err);
        }
    };
}());
//# sourceMappingURL=asyncplify.js.map