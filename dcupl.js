(function(name, definition) {
  if (typeof module != 'undefined') {
    module.exports = definition();
  } else if (typeof define == 'function' && typeof define.amd == 'object') {
    define('name', definition);
  } else {
    this[name] = definition();
  }
}('dcupl', function() {
  var dcupl = {};
  var subscriptions = {};
  var published = {};

  dcupl.namespacer = '.';

  dcupl.subscribe = function(events, callback, latecomer) {
    if (!events || typeof events !== 'string') { console.warn('subscribe: an event name string is required'); return; }

    if (typeof callback !== 'function') { console.warn('subscribe: a callback function is required'); return; }

    //multiple events?
    events = events.split(/\s/);
    var l = events.length;
    var subscribe = function(e) {
      if (typeof subscriptions[e] === 'undefined') {
        subscriptions[e] = [callback];
      } else {
        subscriptions[e].push(callback);
      }

      var args = published[e];
      if (latecomer && typeof args !== 'undefined') {
        callback.apply(null, args);
      }
    };

    //loop through events, could be one or many
    for (var i = 0; i < l; i++) {
      subscribe(events[i]);
    }

    return {
      unsubscribe: function() {
        var checkAndRemove = function(subs) {
          var l = subs.length;
          for (var i = 0; i < l; i++) {
            if (subs[i] === callback) {
              subs.splice(i, i+1);
              return;
            }
          }
        };
        for (var i = 0; i < l; i++) {
          checkAndRemove(subscriptions[events[i]]);
        }
      }
    };
  };

  dcupl.publish = function() {
    var args = Array.prototype.slice.call(arguments);
    var eventName = args.shift();
    var events = subscriptions[eventName];
    var l = 0;
    var i = 0;

    published[eventName] = (typeof args !== 'undefined') ? args : false;

    if (events instanceof Array) {
      l = events.length;
      for ( ; i < l; i++) {
        events[i].apply(null, args);
      }
    }

    //check for ancestors, recursively publish up the tree
    var a = eventName.split(dcupl.namespacer).slice(0, -1);
    if (!a.length) { return; }
    dcupl.publish.apply(dcupl, [a.join(dcupl.namespacer)].concat(args));
  };

  return dcupl;
}));