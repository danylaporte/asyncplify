### concat(sources)
Returns all items from the specified sources sequentially.

sources:
- an array containings source observables.

Example:
```js
asyncplify
	.concat([
		asyncplify.value(0),
		asyncplify.fromArray([1, 2])
	])
	.subscribe(console.log.bind(console));
	// 0
	// 1
	// 2
	// end.
```

Example with the instance operator:
```js
asyncplify
	.value(0)
	.concat([asyncplify.fromArray([1, 2])])
	.subscribe(console.log.bind(console));
	// 0
	// 1
	// 2
	// end.
```

### concatMap(mapper)
Concat sequentially all items returns by the mapper.

mapper:
- a function that create an observable on each item.

Example:
```js
asyncplify
	.fromArray([1, 2, 3])
	.concatMap(function (x) {
		return asyncplify.range(x);
	})
	.subscribe(console.log.bind(console));
	// 0
	// 0
	// 1
	// 0
	// 1
	// 2
	// end.
```

### count(options)
Returns the count based on a condition.

options:
- condition Function

Example:
```js
asyncplify
	.fromArray([1, 2, 4])
	.count()
	.subscribe(console.log.bind(console));
	// 3
	// end.
```

Example with a condition:
```js
asyncplify
	.fromArray([1, 2, 4])
	.count(function (x) { return x > 1; })
	.subscribe(console.log.bind(console));
	// 2
	// end.
```

### debounce(options)
Emit the most recent received item received after delay. 

options:
- delay Number default = 0
- scheduler default = timeout

Example:
```js
asyncplify
	.fromArray([1, 2, 3])
	.debounce(100)
	.subscribe(console.log.bind(console));
	// 3
	// end.
```

### defaultIfEmpty(value)
Emit a value if the source has not emit one.
If the value is not specified, it will emit undefined.

Example:
```js
asyncplify
	.empty()
	.defaultIfEmpty(1)
	.subscribe(console.log.bind(console));
	// 1
	// end.
```

### empty()
Returns a source with no items that terminate on subscribe.

Example:
```js
asyncplify
	.empty()
	.subscribe(console.log.bind(console));
	// end.
```

### flatMap(options)
Invoke a mapper function on each item and subscribe to each item produced by the mapper.

options:
- mapper Function
- maxConcurrency Number default = undefined

Example:
```js
asyncplify
	.fromArray([1, 2, 3])
	.flatMap(function (x) {
		return asyncplify.fromArray([0, x]);
	})
	.subscribe(console.log.bind(console));
	// 0
	// 1
	// 0
	// 2
	// 0
	// 3
	// end.
```

Example with maxConcurrency:
```js
asyncplify
	.fromArray([1, 2, 3])
	.flatMap({
		mapper: function (x) {
			return asyncplify
				.interval()
				.map(function () { return x; })
				.take(2);
		},
		maxConcurrency: 1
	})
	.subscribe(console.log.bind(console));
	// 1
	// 1
	// 2
	// 2
	// 3
	// 3
	// end.
```

### Closing a subscription
Every subscription to asyncplify source can be close.


```js
var subscription = asyncplify
    .fromArray([0, 1, 2, 3, 4])
    .observeOn(asyncplify.schedulers.timeout)
    .subscribe(function (x) {
        console.log(x);
        
        if (x === 2) 
            subscription.close();
    });

// 0
// 1
// 2
// (will be closed here so that no more emit/end event will be sent)
```