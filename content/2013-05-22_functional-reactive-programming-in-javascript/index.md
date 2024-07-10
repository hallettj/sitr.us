+++
title = "Functional Reactive Programming in JavaScript"
date = 2013-05-22
path = "2013/05/22/functional-reactive-programming-in-javascript.html"

[taxonomies]
tags = ["functional programming", "JavaScript"]
+++

I had a great time at [NodePDX][] last week.  There were many talks
packed into a short span of time and I saw many exciting ideas
presented.  One topic that seemed particularly useful to me was [Chris
Meiklejohn's talk on Functional Reactive Programming (FRP)][FRP talk].

<!-- more -->

[NodePDX]: http://nodepdx.org/
[FRP talk]: http://lanyrd.com/2013/nodepdx/schbpc/

I have talked and written about how useful promises are.  See [Promise
Pipelines in JavaScript][promises].  Promises are useful when you want
to represent the outcome of an action or a value that will be available
at some future time.  FRP is similar except that it deals with streams
of reoccurring events and dynamic values.

[promises]: @/2012-07-31_promise-pipelines-in-javascript/index.md

Here is an example of using FRP to subscribe to changes to a text input.
This creates an event stream that could be used for a typeahead search
feature:

```js
var inputs = $('#search')
    .asEventStream('keyup change')
    .map(function(event) { return event.target.value; })
    .filter(function(value) { return value.length > 2; });

var throttled = inputs.throttle(500 /* ms */);

var distinct = throttled.skipDuplicates();
```

This creates an event stream from all `keyup` and `change` events on the
given input.  The stream is transformed into a stream of strings matching
the value of the input when each event occurs.  Then that stream is
filtered so that subscribers to `inputs` will only receive events if the
value of the input has a length greater than two.

Streams can be assigned to variables, shared, and used as inputs to
create more specific streams.  In the example above `inputs` is used to
create two more streams: one that limits the stream so that events are
emitted at most every 500 ms and another that takes the throttled
stream and drops duplicate values that appear consecutively.  So when
the final stream, `distinct`, is consumed later it is guaranteed that
events 1) will be non-empty strings with length greater than two, 2)
will not occur too frequently, and 3) will not include duplicates.

That stream can be fed through a service via ajax calls to show a live
list of results:

```js
function searchWikipedia(term) {
    var url = '//en.wikipedia.org/w/api.php?callback=?';
    return $.getJSON(url, {
        action: 'opensearch',
        format: 'json',
        search: term
    })
    .then(function(data) {
        return { query: data[0], results: data[1] };
    });
}

var suggestions = distinct.flatMapLatest(function(value) {
    return Bacon.fromPromise(searchWikipedia(value));
});

suggestions.onValue(function(data) {
    var $results = $('#results').empty();
    data.results.forEach(function(s) {
        $('<li>').text(s).appendTo($results);
    });
});
```

Here `suggestions` is a new stream that has been transformed from
strings to search results using the `searchWikipedia` function.  All
of jQuery's ajax methods return promises and `Bacon.fromPromise()`
turns a promise into an event stream.

The `flatMapLatest` transformer builds a new stream from an existing
stream and a stream factory - and it only emits events from the last
stream created.  This means that if the user types slowly and a lot of
ajax requests are made responses to all but the last request will be
disregarded.

The `suggestions` stream is ultimately used by calling its `onValue`
method.  That adds a subscriber that runs code for every event that
makes it all the way through the stream.  The result is a list of search
results that is updated live as the user types.

There are some other tricks available.  It is possible to bind data from
an event stream to a DOM element:

```js
var query = suggestions.map(function(data) {
    return data.query;
}).toProperty('--');

query.assign($('#query'), 'text');
```

This creates a new stream that is pared down to just the query used to
produce each set of results.  Whenever a result set is rendered the
corresponding query will also be output as the text content of the
`'#query'` element.  The new stream is converted to a property to make
this work.  A property is a value that varies over time.  The main
practical distinction between a property and an event stream is that
a property always has a value.  In other words a property is
_continuous_ while an event stream is _discrete_.  This example provides
`'--'` as the initial value for the new property.

Notice that property binding as shown here is more general than some
data binding frameworks in that the destination is not limited to DOM
elements and the source is not limited to model instances.  This example
passes values to the `text` method of the given jQuery object.  It is
possible to push data to any method on any object.

Streams can be combined, split, piped, and generally manipulated in all
kinds of ways.  Properties can be bound, sampled, combined, transformed,
or whatever.

I put this code up on JSFiddle so you can try it out and play with it:
[http://jsfiddle.net/hallettj/SqrNT/][fiddle]

[fiddle]: http://jsfiddle.net/hallettj/SqrNT/

There are several FRP implementations out there.  Two that seem to be
prominent are [Bacon.js][] and [RxJS][].  The examples above are code
from the RxJS documentation that I rewrote with Bacon.  That gave me an
opportunity to learn a bit about both libraries and to see how they
approach the same problem.  The original RxJS code is
[here][RxJS example].

[Bacon.js]: https://github.com/raimohanska/bacon.js
[RxJS]: https://github.com/Reactive-Extensions/RxJS
[RxJS example]: https://github.com/Reactive-Extensions/RxJS#why-rxjs

With FRP it is possible to describe complicated processes in a clean,
declarative way.  FRP is also a natural way to avoid certain classes of
race conditions.  When I wrote the initial version of the sample code
above it worked perfectly on the first try.  In my view that is a sign
of a very well-designed library.

If you are interested in further reading I suggest the [series of
tutorials][tutorials] from the author of Bacon.  And there is a great
deal of information on the RxJS and Bacon Github pages, including
documentation and more examples.

[tutorials]: http://nullzzz.blogspot.fi/2012/11/baconjs-tutorial-part-i-hacking-with.html
