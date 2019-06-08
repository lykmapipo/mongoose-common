'use strict';

/* dependencies */
const { sinon, expect, faker } = require('@lykmapipo/test-helpers');
const { include } = require('@lykmapipo/include');
const mongoose = require('mongoose');
const MongooseCommon = include(__dirname, '..');
const {
  LOOKUP_FIELDS,
  SCHEMA_OPTIONS,
  SUB_SCHEMA_OPTIONS,
  Schema,
  SchemaTypes,
  MongooseTypes,
  enableDebug,
  disableDebug,
  isConnection,
  isConnected,
  isSchema,
  isModel,
  isQuery,
  isAggregate,
  toCollectionName,
  isObjectId,
  isMap,
  isString,
  isArraySchemaType,
  isStringArray,
  isNumber,
  isNumberArray,
  isInstance,
  copyInstance,
  schemaTypeOptionOf,
  collectionNameOf,
  connect,
  disconnect,
  clear,
  drop,
  model,
  eachPath,
  jsonSchema,
  modelNames,
  createSubSchema,
  createSchema,
  createModel,
  createVarySubSchema,
  validationErrorFor,
} = MongooseCommon;

describe('unit', () => {
  const MONGODB_URI = 'mongodb://localhost/test';

  beforeEach(done => disconnect(done));
  afterEach(done => drop(done));

  it('should expose shortcuts', () => {
    expect(MongooseCommon.Schema).to.exist;
    expect(MongooseCommon.SchemaTypes).to.exist;
    expect(MongooseCommon.SchemaType).to.exist;
    expect(MongooseCommon.VirtualType).to.exist;
    expect(MongooseCommon.MongooseTypes).to.exist;
    expect(MongooseCommon.Types).to.exist;
    expect(MongooseCommon.MongooseError).to.exist;
    expect(MongooseCommon.Error).to.exist;
    expect(MongooseCommon.CastError).to.exist;
    expect(MongooseCommon.STATES).to.exist;
    expect(MongooseCommon.modelNames).to.exist;
    expect(MongooseCommon.GridFSBucket).to.exist;
    expect(MongooseCommon.Aggregate).to.exist;
    expect(MongooseCommon.Query).to.exist;
  });

  it('should expose schema types shortcuts', () => {
    expect(MongooseCommon.String).to.exist;
    expect(MongooseCommon.SchemaString).to.exist;

    expect(MongooseCommon.Number).to.exist;
    expect(MongooseCommon.SchemaNumber).to.exist;

    expect(MongooseCommon.Boolean).to.exist;
    expect(MongooseCommon.SchemaBoolean).to.exist;

    expect(MongooseCommon.DocumentArray).to.exist;
    expect(MongooseCommon.SchemaDocumentArray).to.exist;

    expect(MongooseCommon.Embedded).to.exist;
    expect(MongooseCommon.SchemaEmbedded).to.exist;

    expect(MongooseCommon.SchemaArray).to.exist;
    expect(MongooseCommon.SchemaArray).to.exist;

    expect(MongooseCommon.SchemaBuffer).to.exist;
    expect(MongooseCommon.SchemaBuffer).to.exist;

    expect(MongooseCommon.Date).to.exist;
    expect(MongooseCommon.SchemaDate).to.exist;

    expect(MongooseCommon.ObjectId).to.exist;
    expect(MongooseCommon.SchemaObjectId).to.exist;

    expect(MongooseCommon.Mixed).to.exist;
    expect(MongooseCommon.SchemaMixed).to.exist;

    expect(MongooseCommon.Decimal).to.exist;
    expect(MongooseCommon.SchemaDecimal).to.exist;

    expect(MongooseCommon.Map).to.exist;
    expect(MongooseCommon.SchemaMap).to.exist;
  });

  it('should provide lookup fields options', () => {
    expect(LOOKUP_FIELDS).to.exist;
    expect(LOOKUP_FIELDS).to.be.an('array');
    expect(LOOKUP_FIELDS).to.be.eql([
      'from',
      'localField',
      'foreignField',
      'as',
    ]);
  });

  it('should provide default schema options', () => {
    expect(SCHEMA_OPTIONS).to.exist;
    expect(SCHEMA_OPTIONS).to.be.an('object');
    expect(SCHEMA_OPTIONS).to.be.eql({
      id: false,
      timestamps: true,
      emitIndexErrors: true,
    });
  });

  it('should provide default sub schema options', () => {
    expect(SUB_SCHEMA_OPTIONS).to.exist;
    expect(SUB_SCHEMA_OPTIONS).to.be.an('object');
    expect(SUB_SCHEMA_OPTIONS).to.be.eql({
      _id: false,
      id: false,
      timestamps: false,
      emitIndexErrors: true,
    });
  });

  it('should provide collection name from model name', () => {
    expect(toCollectionName).to.exist;
    expect(toCollectionName).to.be.a('function');
    expect(toCollectionName).to.have.length(1);

    expect(toCollectionName('User')).to.be.equal('users');
    expect(toCollectionName('File')).to.be.equal('files');
    expect(toCollectionName('fs')).to.be.equal('fs');
    expect(toCollectionName('country')).to.be.equal('countries');
    expect(toCollectionName('Person')).to.be.equal('people');
  });

  it('should check if value is a Connection', () => {
    expect(isConnection).to.exist;
    expect(isConnection).to.be.a('function');
    expect(isConnection).to.have.length(1);

    let val = '12345';
    expect(isConnection(val)).to.be.false;
  });

  it('should check if value is a Query', () => {
    expect(isQuery).to.exist;
    expect(isQuery).to.be.a('function');
    expect(isQuery).to.have.length(1);

    let val = model(new Schema({ name: String })).find();
    expect(isQuery(val)).to.be.true;
    expect(isQuery('124')).to.be.false;
  });

  it('should check if value is a Aggregate', () => {
    expect(isAggregate).to.exist;
    expect(isAggregate).to.be.a('function');
    expect(isAggregate).to.have.length(1);

    let val = model(new Schema({ name: String })).aggregate();
    expect(isAggregate(val)).to.be.true;
    expect(isAggregate('124')).to.be.false;
  });

  it('should check if value is a Model', () => {
    expect(isModel).to.exist;
    expect(isModel).to.be.a('function');
    expect(isModel).to.have.length(1);

    let val = model(new Schema({ name: String }));
    expect(isModel(val)).to.be.true;
    expect(isModel(new Schema({ name: String }))).to.be.false;
    expect(isModel('124')).to.be.false;
  });

  it('should check if value is an ObjectId', () => {
    expect(isObjectId).to.exist;
    expect(isObjectId).to.be.a('function');
    expect(isObjectId).to.have.length(1);

    let val = '12345';
    expect(isObjectId(val)).to.be.false;

    val = new MongooseTypes.ObjectId();
    expect(isObjectId(val)).to.be.true;
  });

  it('should check if value is a Map', () => {
    expect(isMap).to.exist;
    expect(isMap).to.be.a('function');
    expect(isMap).to.have.length(1);

    let val = '12345';
    expect(isMap(val)).to.be.false;

    val = new MongooseTypes.Map();
    expect(isMap(val)).to.be.true;
  });

  it('should check if value is a string schema type', () => {
    expect(isString).to.exist;
    expect(isString).to.be.a('function');
    expect(isString).to.have.length(1);

    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
    });
    let val = schema.path('age');
    expect(isString(val)).to.be.false;

    val = schema.path('name');
    expect(isString(val)).to.be.true;
  });

  it('should check if value is array schema type', () => {
    expect(isArraySchemaType).to.exist;
    expect(isArraySchemaType).to.be.a('function');

    const schema = new Schema({
      tags: { type: [String] },
      groups: [{ type: String }],
      age: { type: Number },
    });
    let val = schema.path('age');
    expect(isArraySchemaType(val)).to.be.false;

    val = schema.path('tags');
    expect(isArraySchemaType(val)).to.be.true;

    val = schema.path('groups');
    expect(isArraySchemaType(val)).to.be.true;
  });

  it('should check if value is a string array schema type', () => {
    expect(isStringArray).to.exist;
    expect(isStringArray).to.be.a('function');
    expect(isStringArray).to.have.length(1);

    const schema = new Schema({
      name: { type: [String] },
      tags: [String],
      levels: { type: [Number] },
    });
    let val = isStringArray(schema.path('name'));
    expect(val).to.be.true;

    val = isStringArray(schema.path('tags'));
    expect(val).to.be.true;

    val = isStringArray(schema.path('levels'));
    expect(val).to.be.false;
  });

  it('should check if value is a number schema type', () => {
    expect(isNumber).to.exist;
    expect(isNumber).to.be.a('function');
    expect(isNumber).to.have.length(1);

    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
    });
    let val = schema.path('name');
    expect(isNumber(val)).to.be.false;

    val = schema.path('age');
    expect(isNumber(val)).to.be.true;
  });

  it('should check if value is a number array schema type', () => {
    expect(isNumberArray).to.exist;
    expect(isNumberArray).to.be.a('function');
    expect(isNumberArray).to.have.length(1);

    const schema = new Schema({
      name: { type: [String] },
      stages: [Number],
      levels: { type: [Number] },
    });
    let val = isNumberArray(schema.path('stages'));
    expect(val).to.be.true;

    val = isNumberArray(schema.path('levels'));
    expect(val).to.be.true;

    val = isNumberArray(schema.path('name'));
    expect(val).to.be.false;
  });

  it('should check if value is a model instance', () => {
    const User = model(new Schema({ name: String }));
    const user = new User();

    expect(isInstance).to.exist;
    expect(isInstance).to.be.a('function');
    expect(isInstance).to.have.length(1);

    expect(user).to.exist;
    expect(isInstance(user)).to.be.true;
  });

  it('should check if value is a model instance', () => {
    const User = model(new Schema({ tags: [String] }));
    const user = new User();

    expect(isInstance).to.exist;
    expect(isInstance).to.be.a('function');
    expect(isInstance).to.have.length(1);

    expect(user).to.exist;
    expect(isInstance(user)).to.be.true;
    expect(isInstance(user.tags)).to.false;
  });

  it('should copy model instance to plain object', () => {
    const User = model(new Schema({ name: String }));
    const user = new User();

    expect(copyInstance).to.exist;
    expect(copyInstance).to.be.a('function');

    const copy = copyInstance(user);

    expect(copy).to.exist;
    expect(isInstance(copy)).to.be.false;
  });

  it('should get schema type options', () => {
    expect(schemaTypeOptionOf).to.exist;
    expect(schemaTypeOptionOf).to.be.a('function');

    const schema = new Schema({ name: { type: String, trim: true } });
    const schemaType = schema.path('name');

    const options = schemaTypeOptionOf(schemaType);
    expect(options).to.exist;
    expect(options.trim).to.be.true;
  });

  it('should be able collection name of registered model', () => {
    model('Edge', new Schema({ name: String }));
    expect(collectionNameOf('Edge')).to.be.equal('edges');
  });

  it('should be able collection name of non registered model', () => {
    expect(collectionNameOf('Pet')).to.be.equal('pets');
  });

  it('should be able get model names', () => {
    model('Edge', new Schema({ name: String }));

    expect(modelNames).to.exist;
    expect(modelNames).to.be.a('function');
    expect(modelNames).to.have.length(0);
    expect(modelNames()).to.include('Edge');
  });

  it('should be able to connect', () => {
    expect(connect).to.exist;
    expect(connect).to.be.a('function');
    expect(connect.length).to.be.equal(2);
  });

  it('should be able to disconnect', () => {
    expect(disconnect).to.exist;
    expect(disconnect).to.be.a('function');
    expect(disconnect.length).to.be.equal(2);
  });

  it('should be able to clear', () => {
    expect(clear).to.exist;
    expect(clear).to.be.a('function');
    expect(clear.length).to.be.equal(0);
  });

  it('should be able to get model silent', () => {
    expect(model).to.exist;
    expect(model).to.be.a('function');
    expect(model.length).to.be.equal(3);
  });

  it('should be able to register model', () => {
    const User = model('User', new Schema({ name: String }));
    expect(User).to.exist;
    expect(User.modelName).to.be.equal('User');
  });

  it('should return already registered model', () => {
    const User = model('User');
    expect(User).to.exist;
    expect(User.modelName).to.be.equal('User');
  });

  it('should return already registered model', () => {
    const User = model('User', new Schema({ name: String }));
    expect(User).to.exist;
    expect(User.modelName).to.be.equal('User');
  });

  it('should get non existing model silent', () => {
    const Profile = model('Profile');
    expect(Profile).to.not.exist;
  });

  it('should register a random model', () => {
    const User = model(new Schema({ name: String }));
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.modelName).to.not.be.equal('User');
  });

  it('should be able to drop', () => {
    expect(drop).to.exist;
    expect(drop).to.be.a('function');
    expect(drop.length).to.be.equal(2);
  });

  it('should be able to connect on given url', done => {
    connect(
      MONGODB_URI,
      (error, instance) => {
        expect(error).to.not.exist;
        expect(instance).to.exist;
        expect(isConnection(instance)).to.be.true;
        expect(isConnected(instance)).to.be.true;
        expect(instance.readyState).to.be.equal(1);
        expect(instance.name).to.be.equal('test');
        done(error, instance);
      }
    );
  });

  it('should check if connected', done => {
    expect(isConnected()).to.be.false;
    expect(isConnected('connection')).to.be.false;
    connect(
      MONGODB_URI,
      (error, instance) => {
        expect(error).to.not.exist;
        expect(instance).to.exist;
        expect(isConnected(instance)).to.be.true;
        expect(isConnected()).to.be.true;
        done(error, instance);
      }
    );
  });

  it('should be able to connect from process.env.MONGODB_URI', done => {
    process.env.MONGODB_URI = MONGODB_URI;
    connect((error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(isConnection(instance)).to.be.true;
      expect(isConnected(instance)).to.be.true;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('test');
      delete process.env.MONGODB_URI;
      done(error, instance);
    });
  });

  it('should be able to clear provided models', done => {
    clear('User', error => {
      expect(error).to.not.exist;
      done(error);
    });
  });

  it('should be able to clear provided models', done => {
    const User = model('User', new Schema({ name: String }));
    clear(User, error => {
      expect(error).to.not.exist;
      done(error);
    });
  });

  it('should be able to clear models', done => {
    clear(error => {
      expect(error).to.not.exist;
      done(error);
    });
  });

  it('should be able to iterate schema path recursive', () => {
    const schema = new Schema({ name: String });
    let paths = [];
    eachPath(schema, (path, schemaType) => {
      expect(path).to.exist;
      expect(schemaType).to.exist;
      paths = paths.concat(path);
    });
    expect(paths).to.include('name');
  });

  it('should be able to iterate schema path recursive', () => {
    const schema = new Schema({ name: { firstName: String } });
    let paths = [];
    eachPath(schema, (path, schemaType) => {
      expect(path).to.exist;
      expect(schemaType).to.exist;
      paths = paths.concat(path);
    });
    expect(paths).to.include('name.firstName');
  });

  it('should be able to iterate schema path recursive', () => {
    const schema = new Schema({
      name: String,
      profile: { interest: String },
      address: {
        street: {
          name: String,
          city: {
            name: String,
            country: { name: String },
          },
        },
      },
    });
    let paths = [];
    eachPath(schema, (path, schemaType) => {
      expect(path).to.exist;
      expect(schemaType).to.exist;
      paths = paths.concat(path);
    });
    expect(paths).to.include('name');
    expect(paths).to.include('profile.interest');
    expect(paths).to.include('address.street.name');
    expect(paths).to.include('address.street.city.name');
    expect(paths).to.include('address.street.city.country.name');
  });

  it('should be able to get model schema path', () => {
    const schema = new Schema({ name: String });
    const User = model(schema);

    expect(User).to.exist;
    expect(User.path).to.exist;
    expect(User.path).to.be.a('function');
    expect(User.path.name).to.be.equal('path');
    expect(User.path.length).to.be.equal(1);
  });

  it('should be able to get model schema path', () => {
    const schema = new Schema({ name: String });
    const User = model(schema);

    const name = User.path('name');
    expect(name).to.exist;
    expect(name).to.be.an.instanceof(mongoose.SchemaType);
    expect(name).to.be.an.instanceof(SchemaTypes.String);
  });

  it('should be able to get model schema path', () => {
    const schema = new Schema({ profile: { interest: String } });
    const User = model(schema);

    const interest = User.path('profile.interest');
    expect(interest).to.exist;
    expect(interest).to.be.an.instanceof(mongoose.SchemaType);
    expect(interest).to.be.an.instanceof(SchemaTypes.String);
  });

  it('should be able to get model schema path', () => {
    const schema = new Schema({ profile: new Schema({ interest: String }) });
    const User = model(schema);

    const interest = User.path('profile.interest');
    expect(interest).to.exist;
    expect(interest).to.be.an.instanceof(mongoose.SchemaType);
    expect(interest).to.be.an.instanceof(SchemaTypes.String);
  });

  it('should be able to get model schema path', () => {
    const schema = new Schema({
      address: { street: { city: { country: String } } },
    });
    const User = model(schema);

    const country = User.path('address.street.city.country');
    expect(country).to.exist;
    expect(country).to.be.an.instanceof(mongoose.SchemaType);
    expect(country).to.be.an.instanceof(SchemaTypes.String);
  });

  it('should be able to get model schema path', () => {
    const schema = new Schema({
      address: new Schema({
        street: new Schema({
          city: new Schema({ country: String }),
        }),
      }),
    });
    const User = model(schema);

    const country = User.path('address.street.city.country');
    expect(country).to.exist;
    expect(country).to.be.an.instanceof(mongoose.SchemaType);
    expect(country).to.be.an.instanceof(SchemaTypes.String);
  });

  it('should able to get jsonschema of a model', () => {
    const schema = new Schema({ name: String });
    const User = model(schema);

    expect(User).to.exist;
    expect(User.jsonSchema).to.exist;
    expect(User.jsonSchema).to.be.a('function');

    const jsonSchema = User.jsonSchema();
    expect(jsonSchema).to.exist;
    expect(jsonSchema).to.be.eql({
      title: User.modelName,
      type: 'object',
      properties: {
        name: { type: 'string' },
        _id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        __v: { type: 'number' },
      },
    });
  });

  it('should able to get connection models jsonschema', () => {
    const schema = new Schema({ name: String });
    const Task = model('Task', schema);

    const jsonSchemas = jsonSchema();
    expect(jsonSchemas).to.exist;
    expect(jsonSchemas).to.be.an('object');
    expect(jsonSchemas.Task).to.be.eql({
      title: Task.modelName,
      type: 'object',
      properties: {
        name: { type: 'string' },
        _id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
        __v: { type: 'number' },
      },
    });
  });

  it('should enable mongoose degugging', () => {
    const set = sinon.spy(mongoose, 'set');

    enableDebug();

    expect(set).to.have.been.calledOnce;
    expect(set).to.have.been.calledWith('debug', true);

    set.restore();
  });

  it('should enable mongoose degugging', () => {
    const set = sinon.spy(mongoose, 'set');

    disableDebug();

    expect(set).to.have.been.calledOnce;
    expect(set).to.have.been.calledWith('debug', false);

    set.restore();
  });

  it('should be able to create sub schema', () => {
    const subSchema = createSubSchema({ name: { type: String } });
    expect(subSchema).to.exist;
    expect(isSchema(subSchema)).to.be.true;
    expect(subSchema.options._id).to.be.false;
    expect(subSchema.options.id).to.be.false;
    expect(subSchema.options.timestamps).to.be.false;
    expect(subSchema.options.emitIndexErrors).to.be.true;
  });

  it('should be able to create schema', () => {
    const schema = createSchema({ name: { type: String } });
    expect(schema).to.exist;
    expect(isSchema(schema)).to.be.true;
    expect(schema.options._id).to.be.true;
    expect(schema.options.id).to.be.false;
    expect(schema.options.timestamps).to.be.true;
    expect(schema.options.emitIndexErrors).to.be.true;
  });

  it('should be able to create schema with plugins', () => {
    const schema = createSchema({ name: { type: String } }, {}, schema => {
      schema.statics.withTest = function withTest() {};
    });
    expect(schema).to.exist;
    expect(schema.base).to.exist;
    expect(schema.path('name')).to.exist;
    expect(schema.statics.withTest).to.exist.and.to.be.a('function');
  });

  it('should be able to create model', () => {
    const modelName = faker.random.uuid();
    const User = createModel({ name: { type: String } }, { modelName });
    expect(User).to.exist;
    expect(User.modelName).to.exist.and.be.equal(modelName);
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
  });

  it('should be able to create model with plugins', () => {
    const modelName = faker.random.uuid();
    const User = createModel(
      { name: { type: String } },
      { modelName },
      schema => {
        schema.statics.withTest = function withTest() {};
      }
    );
    expect(User).to.exist;
    expect(User.modelName).to.exist.and.be.equal(modelName);
    expect(User.base).to.exist;
    expect(User.path('name')).to.exist;
    expect(User.withTest).to.exist.and.to.be.a('function');
  });

  it('should create sub schema with variable paths', () => {
    const schema = createVarySubSchema({ type: String }, 'en', 'sw');
    expect(schema.constructor).to.exist;
    expect(schema.constructor.name).to.be.equal('Schema');

    expect(schema.tree.sw).to.exist;
    expect(schema.tree.en).to.exist;

    const sw = schema.tree.sw;
    const instance = schema.paths.sw.instance;

    expect(instance).to.be.equal('String');
    expect(sw).to.exist;
    expect(sw).to.be.an('object');
    expect(sw.type).to.be.a('function');
    expect(sw.type.name).to.be.equal('String');
  });

  it('should create sub schema with variable paths', () => {
    const schema = createVarySubSchema({ type: String }, 'en', { name: 'sw' });
    expect(schema.constructor).to.exist;
    expect(schema.constructor.name).to.be.equal('Schema');

    expect(schema.tree.sw).to.exist;
    expect(schema.tree.en).to.exist;

    const sw = schema.tree.sw;
    const instance = schema.paths.sw.instance;

    expect(instance).to.be.equal('String');
    expect(sw).to.exist;
    expect(sw).to.be.an('object');
    expect(sw.type).to.be.a('function');
    expect(sw.type.name).to.be.equal('String');
  });

  it('should create sub schema with variable paths', () => {
    const schema = createVarySubSchema({ type: String }, 'en', {
      name: 'sw',
      required: true,
    });
    expect(schema.constructor).to.exist;
    expect(schema.constructor.name).to.be.equal('Schema');

    expect(schema.tree.sw).to.exist;
    expect(schema.tree.en).to.exist;

    const sw = schema.tree.sw;
    const instance = schema.paths.sw.instance;

    expect(instance).to.be.equal('String');
    expect(sw).to.exist;
    expect(sw).to.be.an('object');
    expect(sw.type).to.be.a('function');
    expect(sw.type.name).to.be.equal('String');
    expect(sw.required).to.be.true;
  });

  it('should create validation error', () => {
    let error = validationErrorFor();
    expect(error).to.exist;
    expect(error.name).to.be.equal('ValidationError');
    expect(error.status).to.be.equal(400);
    expect(error.code).to.be.equal(400);
    expect(error.message).to.be.equal('Validation failed');
    expect(error.errors).to.be.eql({});

    let paths = {
      name: {
        type: 'required',
        path: 'name',
        value: undefined,
        reason: 'Not provided',
        message: 'Path `{PATH}` is required.',
      },
    };
    error = validationErrorFor({ paths });
    expect(error).to.exist;
    expect(error.name).to.be.equal('ValidationError');
    expect(error.status).to.be.equal(400);
    expect(error.code).to.be.equal(400);
    expect(error.message).to.be.equal('Validation failed');
    expect(error.errors).to.exist;

    expect(error.errors.name).to.exist;
    expect(error.errors.name.name).to.be.equal('ValidatorError');
    expect(error.errors.name.kind).to.be.equal('required');
    expect(error.errors.name.path).to.be.equal('name');
    expect(error.errors.name.value).to.be.equal(undefined);
    expect(error.errors.name.reason).to.be.equal('Not provided');
    expect(error.errors.name.message).to.be.equal('Path `name` is required.');
  });
});
