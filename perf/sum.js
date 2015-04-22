var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

module.exports = {
    name: 'sum',
    tests: {
        rx: {
            fn: function () {
                rx.Observable.range(0, 1000000).sum().subscribe(function () { });
            }
        },
        asyncplify: {
            fn: function () {
                asyncplify.range(1000000).sum().subscribe();
            }
        }
    }
}
