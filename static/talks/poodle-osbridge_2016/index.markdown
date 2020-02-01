% Take back social media with Poodle
% Jesse Hallett &lt;jesse@sitr.us&gt;
% Open Source Bridge, June 2016

---

http://sitr.us/talks/poodle-osbridge_2016

---

![github.com/hallettj/poodle](icon.svg)

---

Twitter

Facebook

Google+

---

Diaspora

GNU social

pump.io

Buddycloud

---

- identity
- message delivery
- structured messages

---

ActivityStrea.ms

---

- identity <b>&#x2713;</b>
- message delivery <b>&#x2713;</b>
- structured messages

---

![](message-wide.png)

---

![](document-wide.png)

---

![](link-to-document.png)

---

![](permalink.png)

---

![](who-can-see-this-discussion.png)

---

![](private-aside-1.png)

---

![](private-aside-2.png)

---

![](strawpoll.png)

---

```js
{
  "@context": "http://www.w3.org/ns/activitystreams",
  "type": "Create",
  "published": "2016-06-22T15:04:55Z",
  "actor": {
   "type": "Person",
   "id": "mailto:alice@mail.net",
   "name": "Alice",
   "image": {
     "type": "Link",
     "href": "http://example.org/alice/image.jpg",
     "mediaType": "image/jpeg"
   }
  },
  "object" : {
   "id": "cid:b00b3a15-6be4-40bc-980c-a808967042e6/4",
   "type": "Note",
   "name": "Re: Favorite Pokémon?",
   "url": "cid:b00b3a15-6be4-40bc-980c-a808967042e6/4"
  }
}
```

---

```js
{
  ...
  "type": "Update",
  "published": "2016-06-22T15:05:31Z",
  "object": {
    "id": "cid:1b87965f-6578-4ce4-8abc-d8905dbb83ec/4",
    "type": "Note",
    "name": "Re: Favorite Pokémon?",
    "url": "cid:1b87965f-6578-4ce4-8abc-d8905dbb83ec/4"
  },
  "target": {
    "id": "cid:b00b3a15-6be4-40bc-980c-a808967042e6/4"
  }
}
```

---

![](alice-and-bob.png)

---

![](email-as-identity.png)

---

![](chat-via-email.png)

---

![](chat-with-group.png)

---

![](group-grows.png)

---

![](alice-publishes-to-web.png)

---

![](bob-follows-alice.png)

---

github.com/hallettj/poodle

github.com/hallettj/arfe

http://sitr.us/talks/poodle-osbridge_2016
