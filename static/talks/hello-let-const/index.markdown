% Goodbye `var`, hello `let` & `const`
% Jesse Hallett
% PDXjs, October 28, 2015

~~~~ {.javascript}
var x = 1
var y = 2
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.javascript}
let x = 1
const y = 2
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
function getUsers(userIds) {
  var users = {}
  for (var id of usersIds) {
    fetch(`/usrs/${id}`).then(resp => resp.json()).then(user => {
      users[id] = user
    })
  }
  return users
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
for (var i of [1,2,3]) {
  setTimeout(() => console.log(i), 0)
}

// 3
// 3
// 3
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
for (let i of [1,2,3]) {
  setTimeout(() => console.log(i), 0)
}

// 1
// 2
// 3
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
function getUsers(userIds) {
  var users = {}                // NEW VARIABLE SCOPE
  for (var id of usersIds) {
    fetch(`/usrs/${id}`).then(resp => resp.json()).then(user => {
      users[id] = user
    })
  }
  return users
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
function getUsers(userIds) {
  let users = {}                // NEW VARIABLE SCOPE
  for (let id of usersIds) {    // NEW VARIABLE SCOPE
    fetch(`/usrs/${id}`).then(resp => resp.json()).then(user => {
      users[id] = user
    })
  }
  return users
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
function getUsers(userIds) {
  const users = {}              // NEW VARIABLE SCOPE
  for (const id of usersIds) {  // NEW VARIABLE SCOPE
    fetch(`/usrs/${id}`).then(resp => resp.json()).then(user => {
      users[id] = user
    })
  }
  return users
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
const x = 1

x = 2  // javascript says NO!
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.javascript}
let y = 1

y = 2  // ok, if you must
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
const xs = []

xs.push(1)
xs.push(2)

console.log(xs)
// [ 1, 2 ]
~~~~~~~~~~~~~~~~~~~~~~

---

- Babel
- Node v4.x
- Chrome 41
- IE 11 / Edge 12

---

~~~~ {.javascript}
"use strict"
~~~~~~~~~~~~~~~~~~~~~~
