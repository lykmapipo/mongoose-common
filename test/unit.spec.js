'use strict';


/* set environment variables */
process.env.NODE_ENV = 'test';


/* dependencies */
const mongoose = require('mongoose');
const { include } = require('@lykmapipo/include');
const { expect } = require('chai');
const MongooseCommon = include(__dirname, '..');
const {
  SCHEMA_OPTIONS,
  SUB_SCHEMA_OPTIONS,
  Schema,
  SchemaTypes,
  MongooseTypes,
  isObjectId,
  isMap,
  isInstance,
  copyInstance,
  connect,
  disconnect,
  clear,
  drop,
  model,
  eachPath
} = MongooseCommon;


describe('mongoose common', () => {

  const MONGODB_URI = 'mongodb://localhost/mongoose-common';

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
  });

  it('should schema types expose shortcuts', () => {
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

  it('should provide default schema options', () => {
    expect(SCHEMA_OPTIONS).to.exist;
    expect(SCHEMA_OPTIONS).to.be.an('object');
    expect(SCHEMA_OPTIONS).to.be.eql({
      timestamps: true,
      emitIndexErrors: true
    });
  });

  it('should provide default sub schema options', () => {
    expect(SUB_SCHEMA_OPTIONS).to.exist;
    expect(SUB_SCHEMA_OPTIONS).to.be.an('object');
    expect(SUB_SCHEMA_OPTIONS).to.be.eql({
      _id: false,
      id: false,
      timestamps: false,
      emitIndexErrors: true
    });
  });

  it('should be able to check if value is an ObjectId', () => {
    expect(isObjectId).to.exist;
    expect(isObjectId).to.be.a('function');
    expect(isObjectId).to.have.length(1);

    let val = '12345';
    expect(isObjectId(val)).to.be.false;

    val = new MongooseTypes.ObjectId();
    expect(isObjectId(val)).to.be.true;
  });

  it('should be able to check if value is a Map', () => {
    expect(isMap).to.exist;
    expect(isMap).to.be.a('function');
    expect(isMap).to.have.length(1);

    let val = '12345';
    expect(isMap(val)).to.be.false;

    val = new MongooseTypes.Map();
    expect(isMap(val)).to.be.true;
  });

  it('should be able to check if value is a model instance', () => {
    const User = model(new Schema({ name: String }));
    const user = new User();

    expect(isInstance).to.exist;
    expect(isInstance).to.be.a('function');
    expect(isInstance).to.have.length(1);

    expect(user).to.exist;
    expect(isInstance(user)).to.be.true;
  });

  it('should be able to check if value is a model instance', () => {
    const User = model(new Schema({ tags: [String] }));
    const user = new User();

    expect(isInstance).to.exist;
    expect(isInstance).to.be.a('function');
    expect(isInstance).to.have.length(1);

    expect(user).to.exist;
    expect(isInstance(user)).to.be.true;
    expect(isInstance(user.tags)).to.false;
  });

  it('should be able to copy model instance to plain object', () => {
    const User = model(new Schema({ name: String }));
    const user = new User();

    expect(copyInstance).to.exist;
    expect(copyInstance).to.be.a('function');
    expect(copyInstance).to.have.length(1);

    const copy = copyInstance(user);

    expect(copy).to.exist;
    expect(isInstance(copy)).to.be.false;
  });

  it('should be able to connect', () => {
    expect(connect).to.exist;
    expect(connect).to.be.a('function');
    expect(connect.name).to.be.equal('connect');
    expect(connect.length).to.be.equal(2);
  });

  it('should be able to disconnect', () => {
    expect(disconnect).to.exist;
    expect(disconnect).to.be.a('function');
    expect(disconnect.name).to.be.equal('disconnect');
    expect(disconnect.length).to.be.equal(1);
  });

  it('should be able to clear', () => {
    expect(clear).to.exist;
    expect(clear).to.be.a('function');
    expect(clear.name).to.be.equal('clear');
    expect(clear.length).to.be.equal(0);
  });

  it('should be able to get model silent', () => {
    expect(model).to.exist;
    expect(model).to.be.a('function');
    expect(model.name).to.be.equal('model');
    expect(model.length).to.be.equal(3);
  });

  it('should be able to register model', () => {
    const User = model('User', new Schema({ name: String }));
    expect(User).to.exist;
    expect(User.modelName).to.be.equal('User');
  });

  it('should be able to return already registered model', () => {
    const User = model('User');
    expect(User).to.exist;
    expect(User.modelName).to.be.equal('User');
  });

  it('should be able to return already registered model', () => {
    const User = model('User', new Schema({ name: String }));
    expect(User).to.exist;
    expect(User.modelName).to.be.equal('User');
  });

  it('should be able to get no existing model silent', () => {
    const Profile = model('Profile');
    expect(Profile).to.not.exist;
  });

  it('should be able to register random model', () => {
    const User = model(new Schema({ name: String }));
    expect(User).to.exist;
    expect(User.modelName).to.exist;
    expect(User.modelName).to.not.be.equal('User');
  });

  it('should be able to drop', () => {
    expect(drop).to.exist;
    expect(drop).to.be.a('function');
    expect(drop.name).to.be.equal('drop');
    expect(drop.length).to.be.equal(2);
  });

  it('should be able to connect on given url', (done) => {
    connect(MONGODB_URI, (error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('mongoose-common');
      done(error, instance);
    });
  });

  it('should be able to connect from process.env.MONGODB_URI', (done) => {
    process.env.MONGODB_URI = MONGODB_URI;
    connect((error, instance) => {
      expect(error).to.not.exist;
      expect(instance).to.exist;
      expect(instance.readyState).to.be.equal(1);
      expect(instance.name).to.be.equal('mongoose-common');
      delete process.env.MONGODB_URI;
      done(error, instance);
    });
  });

  it('should be able to clear provided models', (done) => {
    clear('User', (error) => {
      expect(error).to.not.exist;
      done(error);
    });
  });

  it('should be able to clear models', (done) => {
    clear((error) => {
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
            country: { name: String }
          }
        }
      }
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
      address: { street: { city: { country: String } } }
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
          city: new Schema({ country: String })
        })
      })
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
        __v: { type: 'number' }
      }
    });
  });

});