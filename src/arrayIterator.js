function ArrayIterator(array) {
    this.array = array;
    this.i = 0;
}

ArrayIterator.prototype.next = function () {
    return {
        done: this.i >= this.array.length,
        value: this.i < this.array.length ? this.array[this.i++] : undefined
    };
}
