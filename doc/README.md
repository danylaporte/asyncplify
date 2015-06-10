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