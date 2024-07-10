+++
title = "CouchDB Notes"
date = 2009-09-13
path = "2009/09/13/couchdb-notes.html"

[taxonomies]
tags = ["CouchDB"]
+++

Recently I gave a talk at [Portland Ruby Brigade][pdxruby] meeting on
[CouchDB][], a document-oriented database.  I thought I would share my notes
from that talk.  In some respects this was a followup to [an earlier talk that
Igal Koshevoy gave comparing various post-relational databases][Igal's talk].
Igal also wrote [some additional notes on my talk][Igal's notes].

<!-- more -->

[pdxruby]: http://pdxruby.org/  "Portland Ruby Brigade"
[CouchDB]: http://couchdb.apache.org/  "CouchDB"
[Igal's talk]: http://groups.google.com/group/pdxruby/browse_thread/thread/6f8734846d3e16d3  "Comparing MongoDB, Tokyo Tyrant, and CouchDB"
[Igal's notes]: http://groups.google.com/group/pdxruby/browse_thread/thread/7865318fbc65d0d1  "Ruby Persistence with CouchDB"

In summary, some of the distinguishing features of CouchDB are:

* Schema-less data store stores documents containing arbitrary JSON data.
* Incrementally updated map-reduce views provide fast access to data, support powerful data processing, and eliminate lookup penalties for data in large or deeply nested documents.
* Map-reduce views - which are again, incrementally updated - provide fast access to aggregate data, such as sums or averages of document attributes.
* Schema-less design means no schema migrations are ever required.  And new map-reduce views can be installed with no downtime.
* "Crash-only" design protects data integrity in almost every crash scenario.  No recovery process is required when rebooting a crashed database server.
* Lock-free design means that read requests never have to wait for other read or write requests to finish.  Writes are only serialized at the point where data is actually written to the disk.
* Integrated, robust master-master replication with automatic conflict handling
* MVCC, or "optimistic locking", prevents data loss from multiple writes to the same document from different sources.
* RESTful interface makes it easy to integrate CouchDB with any environment that speaks HTTP.
* Documents can contain binary attachments.  Attachment support combined with the HTTP interface means that CouchDB can serve HTML, JavaScript, images, and anything else required to host a web application directly from the database.

More detailed information on all of the above points can be found in [CouchDB's
technical overview][technical overview].

[technical overview]: http://couchdb.apache.org/docs/overview.html  "CouchDB Technical Overview"

Some of the downsides:

* Writes and single-document lookups are slower than other databases due to HTTP overhead and frequent disk access.
* CouchDB optimizes CPU and RAM use by using lots of disk space.  The same data set will take up a lot more space in CouchDB than in other database systems.
* You must create map-reduce views in advance for any queries you want to run.  SQL users are used to processing data at query time; but this is not allowed by the CouchDB design (assuming you are not using temporary views in production, which you should not do.)
* There is a serious learning curve when learning to think in terms of map-reduce views.
* Map-reduce views, though very powerful, are not as flexible as SQL queries.  There may be cases where it is necessary to push data processing to an asynchronous job or to the client.
* CouchDB is a young project and its API is undergoing rapid changes.
* Documentation can be sparse - especially when very new features are involved.  

## Ruby Interfaces to CouchDB ##

I also talked about some of the high-level interfaces to CouchDB that are
available for Ruby.  As ActiveRecord did for SQL, the idea behind these
libraries is to abstract away as much of the database behavior as possible
without sacrificing the powerful features that CouchDB provides.  The term
"ORM" does not quite apply to CouchDB because it is not relational.  The term I
am using for the time being is "object-document mapping".  The code examples I
showed are all available in [a gist][gist].

[gist]: http://gist.github.com/161472  "ODM Code Examples"

Sadly I don't think I can say that any of these libraries are production ready
as is.  If you use one expect to write some patches as you go.  That said I
think that all three show some exciting potential.  And they all provide a
better starting point for your CouchDB project than writing your own ODM or
using a low-level interface.  I plan to submit a few patches to CouchPotato as
I get to know it better.  With some more help I imagine we can turn one or more
of these interfaces into a nicely polished library.

The winner in my mind is [CouchPotato][].  The philosophy behind CouchPotato is
to do things differently than ActiveRecord does.  Though it does borrow
features from ActiveRecord, for example dirty attribute tracking, life cycle
callbacks, and validations.  The biggest innovation in CouchPotato in my
opinion is the extensible system for defining views.  As with the other
libraries, support for declaring simple views is built in:

[CouchPotato]: http://upstream-berlin.com/2008/10/27/couch-potato-unleashed-a-couchdb-persistence-layer-in-ruby/  "CouchPotato"

```ruby
class User
    include CouchPotato::Persistence
    property :name
    view :by_name, :key => :name
end
```

But similar shortcuts for more sophisticated types of views can be added by
creating new view classes and passing a `:type` option to the `view`
declaration method.  For example, it might be possible to declare views like
this:

```ruby
class Invoice
    ...
    property :ordered_at, :type => Time
    property :items
    view(:total_sales, :type => :aggregate, :key => :ordered_at,
         :sum => 'items[].qty * items[].price_per_unit')
    view(:average_sale, :type => :aggregate, :key => :ordered_at,
         :average => 'items[].qty * items[].price_per_unit')
end
```

My runner-up is [CouchRest][].  CouchRest is a widely used low-level interface
to CouchDB.  But it also includes a high-level interface called
CouchRest::ExtendedDocument.  A neat feature of this library is that you can
declare a different database to use for each model.  It also supports declaring
simple views with dynamic methods for querying those views:

[CouchRest]: http://github.com/jchris/couchrest  "CouchRest"

```ruby
class Comment < CouchRest::ExtendedDocument
    property :post_id
    view_by :post_id
end

Comment.by_post_id :key => 'foo'
```

[CouchFoo][] is another strong contender.  The goal of CouchFoo is to provide
an API that is as close to ActiveRecord's as possible.  The project may even be
porting a large amount of ActiveRecord code for this purpose.  The intention is
to make migrating to CouchDB as painless as possible.

[CouchFoo]: http://github.com/georgepalmer/couch_foo  "CouchFoo"

An interesting feature is that CouchFoo will create views automatically on
demand.  For example this query will automatically create a view that indexes
Post documents by title:

```ruby
post = Post.find(:first, :conditions => { :title => "First Post" })
```

On-demand view creation could be convenient.  But my instinct is that it is a
bad thing to do.  Adding a new view to a large database comes with an expensive
initial build step.  It seems to me that that type of thing should only be done
explicitly.


## Testimonials ##

I mentioned a case where one team found that they got great performance
improvements by pushing some data reporting tasks from a SQL database to
CouchDB.  That story was written up in a series of blog posts.  An explanation
of why this team went with CouchDB is presented in [part 3 of that series][part3].

[part3]: http://johnpwood.net/2009/07/10/couchdb-views-%E2%80%93-the-advantages/  "CouchDB: Views - The Advantages"

There is [a list on the CouchDB Wiki of sites that are currently using CouchDB
in production][in the wild].  A couple of notable examples not on the list that
have used CouchDB are the [BBC][] and possibly [Meebo][].

[in the wild]: http://wiki.apache.org/couchdb/CouchDB_in_the_wild  "Sites using CouchDB in production"
[BBC]: http://www.erlang-factory.com/conference/London2009/speakers/endafarrell  "The BBC on CouchDB"
[Meebo]: http://code.google.com/p/couchdb-lounge/  "CouchDB Lounge"

Of note for Ubuntu fans:  Canonical is working on a project called [Desktop
Couch][] which will be installed by default in Karmic Koala.  The idea is to
create a portable store for stuff like browser bookmarks, contacts, music
playlists and ratings, and so on.  There are already plugins to allow Firefox
and Evolution to store [bookmarks][] and [contact data][] in CouchDB.  Desktop
Couch will provide CouchDB databases for every user to store this information,
and will include tools for "pairing" computers on the same network.  Desktop
Couch will use CouchDB's built-in replication features to automatically
replicate data between paired computers; so you will get the same bookmarks and
contacts on all of your computers.  This will all integrate with [Ubuntu One][]
too.  Desktop Couch will be able to replicate your data to Ubuntu One's servers
so that you can replicate that data back down to computers on a different
network.

[Desktop Couch]: http://www.kryogenix.org/days/2009/09/03/desktop-couch-irc-talk  "Desktop Couch"
[bookmarks]: http://www.kryogenix.org/days/2009/07/06/firefox-bookmarks-in-couchdb  "Firefox and CouchDB"
[contact data]: http://blogs.gnome.org/rodrigo/2009/06/19/couchdb-contacts-in-evolution  "Evolution and CouchDB"
[Ubuntu One]: https://ubuntuone.com/  "Ubuntu One"


## Exploring Further ##

The best resource for learning more about CouchDB is probably CouchDB: The
Definitive Guide.  This is a book that J. Chris Anderson, Jan Lehnardt, and
Noah Slater are writing for O'Reilly.  It is still a work in progress, but the
[latest draft][The Definitive Guide] is available online.

[The Definitive Guide]: http://books.couchdb.org/relax/  "CouchDB: The Definitive Guide"

For API reference my source is the [CouchDB Wiki][].

[CouchDB Wiki]: http://wiki.apache.org/couchdb/  "CouchDB Wiki"

Finally, as the CouchDB developers will tell you, the most up-to-date reference
for the latest CouchDB features is the included test suite.  This is a set of
tests written in JavaScript that you can run from CouchDB's web interface to
verify that your build of the latest SVN checkout is working correctly.  These
tests are run externally and access the database server via its HTTP API; so
you don't have to know any nitty gritty Erlang stuff to understand what the
tests are doing.  When any changes to the API are introduced this test suite is
updated accordingly.
