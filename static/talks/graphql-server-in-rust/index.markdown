## Writing a GraphQL Server in Rust

Jesse Hallett &lt;https://sitr.us/&gt;

Sr. Software Engineer at Originate, Inc.

Rust, NYC - January 25, 2022

Slides URL: [sitr.us/talks/graphql-server-in-rust/](https://sitr.us/talks/graphql-server-in-rust/)

---

<!-- .slide: class="two-column" -->

```graphql
query {
  posts {
    content
    author {
      username
    }
  }
}
```

```json
{
  "data": {
    "posts": [
      {
        "content": "Hi!",
        "author": {
          "username": "jesse"
        }
      }
    ]
  }
}
```

<!-- .element: class="fragment" -->

---

```graphql [|1,8|2,7|4,6]
query {
  posts {
    content
    author {
      username
    }
  }
}
```

---

<!-- .slide: class="two-column" -->

```graphql
# graphql

type Query {
  posts: [Post!]!
}

type Post {
  id: ID!
  author: User!
  content: String
}

type User {
  id: ID!
  username String!
}
```

```rust
// rust

struct Query;



struct Post {
    id: i32,
    author_id: i32,
    content: Option<String>,
}

struct User {
    id: i32,
    username: String,
}
```

<!-- .element: class="fragment" -->

---

```rust
pub struct Query;

#[Object]
impl Query {
    async fn posts(
        &self, ctx: &Context<'_>
    ) -> Result<Vec<Post>> {
        let posts = sqlx::query_as!(Post,
            "select id, author_id, content from posts",
        )
        .fetch_all(get_db(ctx)?)
        .await?;
        Ok(posts)
    }
}
```

---

```rust
#[derive(SimpleObject)]
pub struct User {
    pub id: i32,
    pub username: String,
}
```

---

<!-- .slide: class="two-column" -->

```rust [|1|2|8|]
#[derive(SimpleObject)]
#[graphql(complex)]
pub struct Post {
    pub id: i32,
    pub content:
        Option<String>,

    #[graphql(skip)]
    pub author_id: i32,
}
```

```rust [|1|3|]
#[ComplexObject]
impl Post {
   async fn author(
       &self, ctx: &Context<'_>
   ) -> Result<User> {
       let u = sqlx::query_as!(
           User, "
select id, username from users
where id = $1",
           self.author_id,
       )
       .fetch_one(get_db(ctx)?)
       .await?;
       Ok(u)
   }}
```

---

```rust [|1|2|4|10|]
let schema = Schema::build(Query,Mutation,EmptySubscription)
    .data(db_pool).finish();

let api = async_graphql_warp::graphql(schema).and_then(
    |(schema, request): (
        Schema<Query, Mutation, EmptySubscription>,
        async_graphql::Request,
    )| async move {
        Ok::<_, Infallible>(GraphQLResponse::from(
            schema.execute(request).await))
    },
);
warp::serve(api).run(([0, 0, 0, 0], 8080)).await;
```

---

<!-- .slide: class="two-column" -->

```graphql
query {
  users {
    username
    posts {
      content
    }
  }
}
```

```json
{
  "data": {
    "users": [
      {
        "username": "jesse",
        "posts": [
          {
            "content": "Hi!"
          }
        ]
      }
    ]
  }
}
```

<!-- .element: class="fragment" -->

---

```rust [|2]
#[derive(SimpleObject)]
#[graphql(complex)]
pub struct User {
    pub id: i32,
    pub username: String,
}
```

---

```rust
#[ComplexObject]
impl User {
    async fn posts(
        &self, ctx: &Context<'_>
    ) -> Result<Vec<Post>> {
        let posts = sqlx::query_as!(Post, "
            select id, author_id, content from posts
            where author_id = $1
            ",
            self.id,
        )
        .fetch_all(get_db(ctx)?).await?;
        Ok(posts)
    }
}
```

---

<!-- .slide: class="two-column" -->

```graphql
mutation NewU($name: String!) {
  createUser(username: $name) {
    id
    username
  }
}

# variables={ "name": "alice" }
```

```json
{
  "data": {
    "createUser": {
      "id": 2,
      "username": "alice"
    }
  }
}
```

<!-- .element: class="fragment" -->

---

```rust [|5|10|14|]
pub struct Mutation;
#[Object]
impl Mutation {
    async fn create_user(
        &self, ctx: &Context<'_>, username: String
    ) -> Result<User> {
        let user = sqlx::query_as!(User, "
            insert into users (username)
            values ($1)
            returning id, username",
            username
        )
        .fetch_one(get_db(ctx)?).await?;
        Ok(user)
    }}
```

---

```graphql
query {
  posts {
    content
    author {
      username
    }
  }
}
```

---

```rust [|6|7|9|]
#[Object]
impl Query {
    async fn posts(
        &self, ctx: &Context<'_>
    ) -> Result<Vec<Post>> {
        if ctx.look_ahead().field("author").exists() {
            fetch_posts_with_author().await;
        } else {
            fetch_posts().await;
        }
    }
}
```

---

### On to the demo code!

[github.com/hallettj/rust_graphql_server_demo](https://github.com/hallettj/rust_graphql_server_demo)

### Slides are online

[sitr.us/talks/graphql-server-in-rust/](https://sitr.us/talks/graphql-server-in-rust/)
