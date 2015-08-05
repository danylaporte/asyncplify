[![npm version](https://badge.fury.io/js/asyncplify.svg)](http://badge.fury.io/js/asyncplify)
[![Build Status](https://travis-ci.org/danylaporte/asyncplify.svg)](https://travis-ci.org/danylaporte/asyncplify)
[![Code Climate](https://codeclimate.com/github/danylaporte/asyncplify/badges/gpa.svg)](https://codeclimate.com/github/danylaporte/asyncplify)

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
- [Book](http://xgrommx.github.io/asyncplify-book/) Thanks to xgrommx!
- [Doc](https://github.com/danylaporte/asyncplify/tree/master/doc)
- [Performance](https://github.com/danylaporte/asyncplify/tree/master/perf)


## License ##
The MIT License (MIT)

Copyright (c) 2015 Dany Laporte