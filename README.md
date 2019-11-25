# mongoose-common

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-common.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-common)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-common/status.svg)](https://david-dm.org/lykmapipo/mongoose-common)

Re-usable helpers for mongoose

## Requirements

- NodeJS v9.3+

## Install
```sh
$ npm install --save mongoose @lykmapipo/mongoose-common
```

## Usage

```javascript
const {
  connect,
  clear,
  syncIndexes,
  disconnect,
  drop
} = require('@lykmapipo/mongoose-common');

connect(error => { ... });

clear(error => { ... });

syncIndexes(error => { ... });

drop(error => { ... });

disconnect(error => { ... });

...

```

## API

### `connect([url: String], done: Function)`
Establish connection using provided connection string or `process.env.MONGODB_URI`.

Example:
```js
connect((error) => { ... });
```

### `clear([connection:Connection], [...modelNames: String], done: Function)`
Clear data of specified `modelNames`. If none provided all models will be cleared. If `connection` not provided default mongoose connection will be used.

Example
```js
clear((error) => { ... });
clear('User', (error) => { ... });
clear('User', 'Profile', (error) => { ... });
```

### `drop([connection: Connection], done: Function)`
Deletes the test database, including all collections, documents, and indexes. If `connection` not provided default mongoose connection will be used.

Example
```js
drop((error) => { ... });
drop(connection, (error) => { ... });
```

### `disconnect([connection: Connection], done: Function)`
Close all connections or provided connection

Example
```js
disconnect((error) => { ... }); //close all
disconnect(connection, (error) => { ... }); //close provided
```

### `model([name: String], [schema: Schema], [connection: Connection])`
Try to obtain existing model or register new model safely. If `connection` not provided default mongoose connection will be used.

Example
```js
const User = model('User'); // get safely
const User = model('User', schema); // get or register safely
const random = model(schema); // register random model safely
const User = model('User', schema, connection); // get or register safely
```

### `eachPath(schema: Schema, iteratee: Function)`
Iterate recursively on schema primitive paths and invoke provided iteratee function.

Example
```js
eachPath(schema, (path, schemaType) => { ... });
```

### `path(pathName: String)`
A shortcut to obtain schema path from model.

Example
```js
User.path('name');
User.path('name.given');
User.path('name.surname');
```

### `isObjectId(value: Any)`
Check if provided value is an instance ObjectId

Example
```js
const _isObjectId = isObjectId(value);
```

### `isMap(value: Any)`
Check if provided value is an instance MongooseMap

Example
```js
const _isMap = isMap(value);
```

### `isInstance(value: Any)`
Check if provided value is an mongoose model instance

Example
```js
const _isInstance = isInstance(value);
```

### `copyInstance(value: Any)`
Copy and return plain object of mongoose model instance

Example
```js
const copyOfInstance = copyInstance(value);
```

### `isSchema(value: Any)`
Check if provided value is an mongoose schema instance

Example
```js
const _isSchema = isSchema(value);
```

### `isConnection(value: Any)`
Check if provided value is an mongoose connection instance

Example
```js
const _isConnection = isConnection(value);
```

### `isConnected(connection: Connection)`
Check state of provided mongoose connection if is `connected`.

Example:
```js
const connected = isConnected(conn);
```

### `toCollectionName(modelName: String)`
Produces a collection name of provided model name.

Example:
```js
const collectionName = toCollectionName('User'); // => users
```


## Environment
```js
SEED_PATH=`${process.cwd}/seeds`
SEED_FRESH=false
```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) 2018 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 