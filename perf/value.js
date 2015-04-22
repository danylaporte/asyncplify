var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

module.exports = {
    name: 'value',
    tests: {
        rx: {
            fn: function () {
                rx.Observable.return(10).subscribe(function () {});
            }
        },
        asyncplify: {
            fn: function () {
                asyncplify.value(10).subscribe();
            }
        }
    }
};
