# Requestor
Requests have never been more convenient and declerative. The `Requestor` library lets you define request data-stractures like [ModelRequestor](#ModelRequestor) and [CollectionRequestor](#CollectionRequestor) which can be used anywhere, anytime, on different documents. Not only that, the `Requestor` will also chain the requests using es6's `Promise`.

`Requestor` is available for both server-side and client side and can be downloaded via [Github](https://github.com/DAB0mB/requestor).

## Dependencies
`Requestor` has the following dependencies on client side:
- Promise - Which won't work on old browsers and can be loaded using any polyfilling library.
- jquery - Which is used to make ajax requests. A costume request method can be defined using [defineRequestMethod](#defineRequestMethod).

## Example
```js
var Post = ModelRequestor("Post", {
  urlRoot: "http://www.mail.com",
  entity: "posts",

  requests: {
    markAsRead: "PUT ./markAsRead",
    isReaden:   "PUT ./isReaden  "
  },

  createMarkAsReadRequestData: function(data) {
    return { markAsRead: data };
  },

  transformIsReadenResponseBody: function(body) {
    return body.isReaden;
  }
});

var post = new Post();

post.create({ username: "DAB0mB" }).then(function() {
  return post.markAsRead(true);
}).then(function() {
  return post.isReaden();
}).then(function(isReaden) {
  console.log(isReaden);
});
```

## API

### Requestor

#### defineRequestMethod(fn)
Defines a custome request method

#### Model(name, proto)
Creates a model requestor which is responsible for making requests related to a single document.
Returns a class which inherits from [ModelRequestor](#ModelRequestor).

#### Collection(name, proto)
Creates a collection requestor which is responsible for making requests related to multi documents or a collection of documents.
Returns a class which inherits from [CollectionRequestor](#CollectionRequestor).

### ModelRequestor

### CollectionRequestor
