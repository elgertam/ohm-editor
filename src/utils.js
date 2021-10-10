'use strict';

function objectForEach(obj, func) {
  Object.keys(obj).forEach(function(key) {
    return func(key, obj[key], obj);
  });
}

module.exports = {
  objectForEach: objectForEach,
  objectMap: function(obj, func) {
    return Object.keys(obj).map(function(key) {
      return func(key, obj[key], obj);
    });
  },

  repeat: function(n, fn) {
    if (n < 0) {return;}
    while (n > 0) {
      fn();
      n--;
    }
  },

  shuffle: function(a) {
    let j;
    let x;
    let i;
    for (i = a.length; i; i -= 1) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  },

  // same as a\b
  difference: function(a, b) {
    return a.filter(function(item) {
      return b.indexOf(item) === -1;
    });
  },

  includes: function(array, item) {
    return array.indexOf(item) !== -1;
  },
};
