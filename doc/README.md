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

### Handle backpressure with Pause, Resume, Close
Every subscription to asyncplify source can be paused, resume or close.


```js
var subscription = asyncplify
    .fromArray([0, 1, 2, 3, 4])
    .observeOn(asyncplify.schedulers.timeout)
    .subscribe(function (x) {
        console.log(x);
        
        if (x === 2) 
            subscription.pause();
    });

setTimeout(function () {
    subscription.resume();
}, 1000);

// 0
// 1
// 2
// (will be paused for 1000 ms)
// 3
// 4
// end.
```