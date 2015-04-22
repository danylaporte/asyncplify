var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

module.exports = {
    name: 'value',
    tests: {
        rx: {
            fn: function () {
                rx.Observable.range(0, 4).toArray().subscribe(function () {});
            }
        },
        asyncplify: {
            fn: function () {
                asyncplify.range(4).toArray().subscribe();
            }
        }
    }
};
