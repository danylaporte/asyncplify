var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

module.exports = {
    name: 'sum',
    tests: {
        rx: {
            fn: function () {
                rx.Observable.range(0, 100).sum().subscribe(function () { });
            }
        },
        asyncplify: {
            fn: function () {
                asyncplify.range(100).sum().subscribe();
            }
        }
    }
}
