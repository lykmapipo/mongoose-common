#### exports.LOOKUP_FIELDS() 

Common lookup fields used in aggregation






##### Examples

```javascript

const { LOOKUP_FIELDS } = require('@lykmapipo/mongoose-common');
//=> ['from', 'localField', 'foreignField', 'as']
```


##### Returns


- `Void`



#### exports.SCHEMA_OPTIONS() 

Common options to set on schema






##### Examples

```javascript

const { SCHEMA_OPTIONS } = require('@lykmapipo/mongoose-common');
//=> { timestamps: true, ... }
```


##### Returns


- `Void`



#### exports.SUB_SCHEMA_OPTIONS() 

Common options to set on sub doc schema






##### Examples

```javascript

const { SUB_SCHEMA_OPTIONS } = require('@lykmapipo/mongoose-common'); 
//=> { timestamps: false, ... }
```


##### Returns


- `Void`



#### exports.isConnection(val) 

Check if provided value is an instance of mongoose connection




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a Connection | &nbsp; |




##### Examples

```javascript

isConnection(conn);
//=> true
```


##### Returns


- `Void`



#### exports.isConnected(val) 

Check if provided mongoose connection is connected




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Connection`  | valid mongoose connection to check it state | &nbsp; |




##### Examples

```javascript

isConnected(conn);
//=> true
```


##### Returns


- `Void`



#### exports.isSchema(val) 

Check if provided value is an instance of mongoose schema




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a Schema | &nbsp; |




##### Examples

```javascript

isSchema(schema);
//=> true
```


##### Returns


- `Void`



#### exports.isModel(val) 

Check if provided value is valid of mongoose model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a mongoose model | &nbsp; |




##### Examples

```javascript

isModel(model);
//=> true
```


##### Returns


- `Void`



#### exports.isQuery(val) 

Check if provided value is an instance of mongoose query




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a query instance | &nbsp; |




##### Examples

```javascript

isQuery(query);
//=> true
```


##### Returns


- `Void`



#### exports.isAggregate(val) 

Check if provided value is an instance of mongoose aggregate




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a aggregate instance | &nbsp; |




##### Examples

```javascript

isAggregate(query);
//=> true
```


##### Returns


- `Void`



#### exports.enableDebug() 

Enable internal mongoose debug option






##### Examples

```javascript

enableDebug();
```


##### Returns


- `Void`



#### exports.disableDebug() 

Disable internal mongoose debug option






##### Examples

```javascript

disableDebug();
```


##### Returns


- `Void`



#### exports.toCollectionName(modelName) 

Produces a collection name of provided model name




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| modelName | `String`  | a model name | &nbsp; |




##### Examples

```javascript

const collectionName = toCollectionName('User'); 
//=> users
```


##### Returns


- `String`  a collection name



#### exports.isObjectId(val) 

Check if provided value is an instance of ObjectId




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its an ObjectId | &nbsp; |




##### Examples

```javascript

isObjectId(val);
//=> true
```


##### Returns


- `Void`



#### exports.isMap(val) 

Check if provided value is an instance of Map




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a Map | &nbsp; |




##### Examples

```javascript

isMap(val);
//=> true
```


##### Returns


- `Void`



#### exports.isString(val) 

Check if provided value is an instance of String schema type




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a String schema type | &nbsp; |




##### Examples

```javascript

isString(val);
//=> true
```


##### Returns


- `Void`



#### exports.isArraySchemaType(val) 

check if schema type is array




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `SchemaType`  | valid mongoose schema type | &nbsp; |




##### Examples

```javascript

isArraySchemaType(val)
//=> true
```


##### Returns


- `Boolean`  whether schema type is array



#### exports.isStringArray(val) 

Check if provided value is an instance of StringArray schema type




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a StringArray schema type | &nbsp; |




##### Examples

```javascript

isStringArray(val);
//=> true
```


##### Returns


- `Void`



#### exports.isNumber(val) 

Check if provided value is an instance of Number schema type




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a Number schema type | &nbsp; |




##### Examples

```javascript

isNumber(<val>);
//=> true
```


##### Returns


- `Void`



#### exports.isNumberArray(val) 

Check if provided value is an instance of NumberArray schema type




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| val | `Mixed`  | value to check if its a NumberArray schema type | &nbsp; |




##### Examples

```javascript

isNumberArray(val);
//=> true
```


##### Returns


- `Void`



#### exports.isInstance(value) 

check if object is valid mongoose model instance




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| value | `Object`  | valid object | &nbsp; |




##### Examples

```javascript

isInstance(val);
//=> true
```


##### Returns


- `Boolean`  whether object is valid model instance



#### exports.copyInstance(value) 

copy and return plain object of mongoose model instance




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| value | `Object`  | valid object | &nbsp; |




##### Examples

```javascript

const instance = copyInstance(val);
//=> { ... }
```


##### Returns


- `Object`  plain object from mongoose model instance



#### exports.schemaTypeOptionOf(schemaType)  *private method*

obtain schema type options




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| schemaType | `SchemaType`  | valid mongoose schema type | &nbsp; |




##### Examples

```javascript

const options = schemaTypeOptionOf(schemaType)
//=> { trim: true, ... }
```


##### Returns


- `Object`  schema type options



#### exports.collectionNameOf(modelName) 

obtain collection name of provided model name




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| modelName | `String`  | valid model name | &nbsp; |




##### Examples

```javascript

const collectionName = collectionNameOf('User');
//=> 'users'
```


##### Returns


- `String`  underlying collection of the model



#### exports.connect([url], done) 

Opens the default mongoose connection




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| url | `String`  | valid mongodb conenction string. if not provided it will be obtained from process.env.MONGODB_URI or package name prefixed with <br>current execution environment name | *Optional* |
| done | `Function`  | a callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

connect(done);
connect(url, done);
```


##### Returns


- `Void`



#### exports.disconnect(done) 

Close all mongoose connection




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| done | `Function`  | a callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

disconnect(done);
```


##### Returns


- `Void`



#### exports.clear([connection], modelNames, done) 

Clear provided collection or all if none give




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| connection | `Connection`  | valid mongoose database connection. If not provide default connection will be used.  | *Optional* |
| modelNames | `Array.<String>` `String` `String`  | name of models to clear | &nbsp; |
| done | `Function`  | a callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

clear(done);
clear('User', done);
clear('User', 'Profile', done);
```


##### Returns


- `Void`



#### exports.drop([connection], done) 

Deletes the given database, including all collections, documents, and indexes




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| connection | `Connection`  | valid mongoose database connection. If not provide default connection will be used.  | *Optional* |
| done | `Function`  | a callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

drop(done);
```


##### Returns


- `Void`



#### exports.model([modelName, schema, connection]) 

Try obtain already registered or register new model safely.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| modelName | `String`  | valid model name | *Optional* |
| schema | `Schema`  | valid mongoose schema instance | *Optional* |
| connection | `Connection`  | valid mongoose database connection. If not provide default connection will be used. | *Optional* |




##### Examples

```javascript

const User = model('User');
const User = model('User', Schema);
```


##### Returns


- `Void`



#### exports.eachPath(Schema, iteratee) 

iterate recursively on schema primitive paths and invoke provided iteratee function.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| Schema | `Schema`  | valid instance of mongoose schema | &nbsp; |
| iteratee | `Function`  | callback function invoked per each path found. The callback is passed the pathName, parentPath and schemaType as arguments <br>on each iteration. | &nbsp; |




##### Examples

```javascript

eachPath(schema, (path, schemaType) => { ... });
```


##### Returns


- `Void`



#### exports.jsonSchema() 

Produces valid json schema of all available models






##### Examples

```javascript

const jsonSchema = jsonSchema(); 
//=> {"user": {title: "User", type: "object", properties: {..} } }
```


##### Returns


- `Void`



#### exports.syncIndexes(done) 

Sync indexes in MongoDB to match, indexes defined in schemas




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| done | `Function`  | a callback to invoke on success or failure | &nbsp; |




##### Examples

```javascript

syncIndexes(done);
```


##### Returns


- `Void`



#### exports.createSubSchema(definition[, optns]) 

Create mongoose sub schema with no id and timestamp




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| definition | `Object`  | valid model schema definition | &nbsp; |
| optns | `Object`  | valid schema options | *Optional* |




##### Examples

```javascript

const User = createSubSchema({ name: { type: String } });
```


##### Returns


- `Schema`  valid mongoose sub schema



#### exports.createSchema(definition[, optns, plugins]) 

Create mongoose schema with timestamps




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| definition | `Object`  | valid model schema definition | &nbsp; |
| optns | `Object`  | valid schema options | *Optional* |
| plugins | `Function`  | list of valid mongoose plugin to apply | *Optional* |




##### Examples

```javascript

const User = createSchema({ name: { type: String } });
```


##### Returns


- `Schema`  valid mongoose schema



#### exports.createModel(schema, options[, plugins, connection]) 

Create and register mongoose model




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| schema | `Object`  | valid model schema definition | &nbsp; |
| options | `Object`  | valid model schema options | &nbsp; |
| options.modelName | `String`  | valid model name | &nbsp; |
| plugins | `Function`  | list of valid mongoose plugin to apply | *Optional* |
| connection | `Connection`  | valid mongoose database connection. If not provide default connection will be used. | *Optional* |




##### Examples

```javascript

const User = createModel({ name: { type: String } }, { name: 'User' });
const User = createModel(
 { name: { type: String } }, 
 { name: 'User' }, 
 autopopulate, hidden
);
```


##### Returns


- `Model`  valid mongoose model



#### exports.createVarySubSchema(optns, paths) 

Create sub schema with variable paths




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid schema type options | &nbsp; |
| paths | `Object` `String`  | variable paths to include on schema | &nbsp; |




##### Examples

```javascript

const locale = createVarySubSchema({ type: String }, 'en', 'sw');
const locale = createVarySubSchema(
 { type: String }, 
 { name: 'en': required: true },
 'sw'
);
```


##### Returns


- `Schema`  valid mongoose schema



#### exports.validationErrorFor(optns) 

Create mongoose validation error for specified options




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| optns | `Object`  | valid error options | &nbsp; |
| optns.status | `Number` `String`  | valid error status | *Optional* |
| optns.code | `Number` `String`  | valid error code | *Optional* |
| optns.paths | `Object`  | paths with validator error properties | *Optional* |




##### Examples

```javascript

const status = 400;
const paths = { 
  name: { type: 'required', path:'name', value: ..., message: ...  } 
};
const error = validationErrorFor({ status, paths });
//=> error
```


##### Returns


- `ValidationError`  valid instance of mongoose validation error




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
