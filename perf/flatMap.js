var asyncplify = require('../dist/asyncplify');
var rx = require('rx');
var t = require('transducers-js');

function increment(x) { return x + 1; }
function isEven(x) { return x % 2 === 0; }
function noop() { }

suite('map/filter', function () {
    test('asyncplify', function (done) {
        asyncplify.fromArray([1,2,3,4]).map(increment).filter(isEven).subscribe({ end: done });
    });
    
    test('transducers-js', function (done) {
        t.into([], t.comp(t.map(increment), t.filter(isEven)), [1,2,3,4]);
        done();
    });

    test('rx', function (done) {
        rx.Observable.from([1,2,3,4]).map(increment).filter(isEven).subscribe(noop, noop, done);
    });
});