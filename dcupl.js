define('dcupl', function() {
  var dcupl = {},
    subscriptions = {},
    published = {};

  dcupl.namespacer = '.';

  dcupl.subscribe = function(events, callback, latecomer) {
    if (!events || typeof events !== 'string') { console.warn('subscribe: an event name string is required'); return; }

    if (typeof callback !== 'function') { console.warn('subscribe: a callback function is required'); return; }

    //multiple events?
    var events = events.split(/\s/),
      l = events.length,
      subscribe = function(e) {
        if (typeof subscriptions[e] === 'undefined') {
          subscriptions[e] = [callback];
        } else {
          subscriptions[e].push(callback);
        }

        var args = published[e];
        if (latecomer && typeof args !== 'undefined') {
          callback.apply(null, args);
        }
      }

    //loop through events, could be one or many
    for (var i = 0; i < l; i++) {
      subscribe(events[i]);
    }
  }

  dcupl.unsubscribe = function(events, callback) {
    var events = events.split(/\s/),
      l = events.length,
      unsubscribe = function(e) {
        if (typeof subscriptions[e] !== 'undefined') {
          var i = 0,
            l = subscriptions[e].length;
          for ( ; i < l; i++) {
            if (subscriptions[e][i] === callback) {
              subscriptions[e].slice(i, 1);
              return e;
            }
          }
          return false;
        }
      }

    //loop through events, could be one or many
    for (var i = 0; i < l; i++) {
      unsubscribe(events[i]);
    }
  }

  dcupl.publish = function() {
    var args = Array.prototype.slice.call(arguments),
      eventName = args.shift(),
      events = subscriptions[eventName],
      l = 0,
      i = 0;


    published[eventName] = args;

    if (events instanceof Array) {
      events.published = true;
      l = events.length;
      for ( ; i < l; i++) {
        events[i].apply(null, args);
      }
    }

    //check for ancestors, recursively publish up the tree
    var a = eventName.split(dcupl.namespacer).slice(0, -1);
    if (!a.length) { return; }
    dcupl.publish.apply(dcupl, [a.join(dcupl.namespacer)].concat(args));
  }

  return dcupl;
});