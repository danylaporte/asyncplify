var asyncplify = require('../dist/asyncplify');

describe('pipe', function() {
    
    it('should emit values', function (done) {

    function customMapper(mapper) {
        return function (self) {
            return self.map(mapper);
        };
    }
    
    var array = [];

    asyncplify
        .range(3)
        .pipe(customMapper(function (v) {
            return v + 1;
        }))
        .subscribe({
            emit: function (v) { array.push(v); },
            end: function (err) {
                array.should.eql([1, 2, 3]);
                done();
            }
        });
    });
});