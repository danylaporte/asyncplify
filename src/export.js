if (typeof module !== 'undefined') {
    module.exports = Asyncplify;
} else if (typeof window !== 'undefined') {
    window.Asyncplify = window.asyncplify = Asyncplify;
}
