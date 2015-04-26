# asyncplify
FRP (functional reactive programming) library for Javascript.

This is a lightweight reimplementation of [RxJS](https://github.com/Reactive-Extensions/RxJS) with speed in mind.

```js
var asyncplify = require('asyncplify')

asyncplify
    .fromArray([1, 2, 3])
    .filter(function (v) {
        return v > 1;
    })
    .subscribe(function (v) {
        console.log(v);
    });

// emit 2
// emit 3
// end.
```

## Installation

```bash
$ npm install asyncplify
```

## Documentation
- [Performance](https://github.com/danylaporte/asyncplify/tree/master/perf)


## License ##
The MIT License (MIT)

Copyright (c) 2015 Dany Laporte