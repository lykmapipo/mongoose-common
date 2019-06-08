'use strict';

/* dependencies */
const _ = require('lodash');
const { expect } = require('@lykmapipo/test-helpers');
const { waterfall } = require('async');
const { include } = require('@lykmapipo/include');
const { Schema, ObjectId, model, connect, drop, syncIndexes } = include(
  __dirname,
  '..'
);

describe('integration', () => {
  before(done => connect(done));
  after(done => drop(done));

  it('should beautify unique error on create', done => {
    const schema = new Schema({ name: { type: String, unique: true } });
    const User = model(schema);
    const user = { name: 'John Doe' };

    // wait index
    User.once('index', () => {
      User.create([user, user], error => {
        expect(error).to.exist;
        expect(error.status).to.exist;
        expect(error.name).to.exist;
        expect(error.name).to.be.equal('ValidationError');
        expect(error._message).to.exist;
        expect(error.message).to.exist;
        expect(error.errors).to.exist;
        expect(error.errors.name).to.exist;
        expect(error.errors.name.kind).to.exist;
        expect(error.errors.name.kind).to.be.equal('unique');
        expect(error.errors.name.value).to.be.equal(user.name);
        done();
      });
    });
  });

  it('should beautify unique error on insertMany', done => {
    const schema = new Schema({ name: { type: String, unique: true } });
    const User = model(schema);
    const user = { name: 'John Doe' };

    // wait index
    User.once('index', () => {
      User.insertMany([user, user], error => {
        expect(error).to.exist;
        expect(error.status).to.exist;
        expect(error.name).to.exist;
        expect(error.name).to.be.equal('ValidationError');
        expect(error._message).to.exist;
        expect(error.message).to.exist;
        expect(error.errors).to.exist;
        expect(error.errors.name).to.exist;
        expect(error.errors.name.kind).to.exist;
        expect(error.errors.name.kind).to.be.equal('unique');
        expect(error.errors.name.value).to.be.equal(user.name);
        done();
      });
    });
  });

  it('should beautify compound unique error on create', done => {
    const schema = new Schema({ firstName: String, lastName: String });
    schema.index({ firstName: 1, lastName: 1 }, { unique: true });
    const User = model(schema);
    const user = { firstName: 'John', lastName: 'Doe' };

    // wait index
    User.once('index', () => {
      User.create([user, user], error => {
        expect(error).to.exist;
        expect(error.status).to.exist;
        expect(error.name).to.exist;
        expect(error.name).to.be.equal('ValidationError');
        expect(error._message).to.exist;
        expect(error.message).to.exist;
        expect(error.errors).to.exist;
        expect(error.errors.firstName).to.exist;
        expect(error.errors.firstName.kind).to.exist;
        expect(error.errors.firstName.kind).to.be.equal('unique');
        expect(error.errors.firstName.value).to.be.equal(user.firstName);
        expect(error.errors.lastName).to.exist;
        expect(error.errors.lastName.kind).to.exist;
        expect(error.errors.lastName.kind).to.be.equal('unique');
        expect(error.errors.lastName.value).to.be.equal(user.lastName);
        done();
      });
    });
  });

  it('should beautify compound unique error on insertMany', done => {
    const schema = new Schema({ firstName: String, lastName: String });
    schema.index({ firstName: 1, lastName: 1 }, { unique: true });
    const User = model(schema);
    const user = { firstName: 'John', lastName: 'Doe' };

    // wait index
    User.once('index', () => {
      User.insertMany([user, user], error => {
        expect(error).to.exist;
        expect(error.status).to.exist;
        expect(error.name).to.exist;
        expect(error.name).to.be.equal('ValidationError');
        expect(error._message).to.exist;
        expect(error.message).to.exist;
        expect(error.errors).to.exist;
        expect(error.errors.firstName).to.exist;
        expect(error.errors.firstName.kind).to.exist;
        expect(error.errors.firstName.kind).to.be.equal('unique');
        expect(error.errors.firstName.value).to.be.equal(user.firstName);
        expect(error.errors.lastName).to.exist;
        expect(error.errors.lastName.kind).to.exist;
        expect(error.errors.lastName.kind).to.be.equal('unique');
        expect(error.errors.lastName.value).to.be.equal(user.lastName);
        done();
      });
    });
  });

  it('should beautify ObjectId unique error on create', done => {
    const schema = new Schema({ name: { type: String } });
    const User = model(schema);
    const user = new User({ name: 'John Doe' }).toObject();

    // wait index
    User.once('index', () => {
      User.create([user, user], error => {
        expect(error).to.exist;
        expect(error.status).to.exist;
        expect(error.name).to.exist;
        expect(error.name).to.be.equal('ValidationError');
        expect(error._message).to.exist;
        expect(error.message).to.exist;
        expect(error.errors).to.exist;
        expect(error.errors._id).to.exist;
        expect(error.errors._id.kind).to.exist;
        expect(error.errors._id.kind).to.be.equal('unique');
        expect(error.errors._id.value).to.be.equal(user._id.toString());
        done();
      });
    });
  });

  it('should beautify ObjectId compound unique error on create', done => {
    const schema = new Schema({
      firstName: String,
      lastName: String,
      profile: ObjectId,
    });
    schema.index({ profile: 1, firstName: 1, lastName: 1 }, { unique: true });
    const User = model(schema);
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      profile: new User()._id,
    };

    // wait index
    User.once('index', () => {
      User.create([user, user], error => {
        expect(error).to.exist;
        expect(error.status).to.exist;
        expect(error.name).to.exist;
        expect(error.name).to.be.equal('ValidationError');
        expect(error._message).to.exist;
        expect(error.message).to.exist;
        expect(error.errors).to.exist;

        expect(error.errors.profile).to.exist;
        expect(error.errors.profile.kind).to.exist;
        expect(error.errors.profile.kind).to.be.equal('unique');
        expect(error.errors.profile.value).to.be.equal(user.profile.toString());
        expect(error.errors.profile.index).to.equal(
          'profile_1_firstName_1_lastName_1'
        );

        expect(error.errors.firstName).to.exist;
        expect(error.errors.firstName.kind).to.exist;
        expect(error.errors.firstName.kind).to.be.equal('unique');
        expect(error.errors.firstName.value).to.be.equal(user.firstName);
        expect(error.errors.firstName.index).to.equal(
          'profile_1_firstName_1_lastName_1'
        );

        expect(error.errors.lastName).to.exist;
        expect(error.errors.lastName.kind).to.exist;
        expect(error.errors.lastName.kind).to.be.equal('unique');
        expect(error.errors.lastName.value).to.be.equal(user.lastName);
        expect(error.errors.lastName.index).to.equal(
          'profile_1_firstName_1_lastName_1'
        );
        done();
      });
    });
  });

  it('should sync indexes', done => {
    const User = model(
      new Schema(
        {
          name: { type: String, index: true },
        },
        { autoIndex: false }
      )
    );

    waterfall(
      [
        next => User.createCollection(error => next(error)),
        next =>
          User.listIndexes((error, indexes) => {
            expect(_.find(indexes, { name: 'name_1' })).to.not.exist;
            next(error);
          }),
        next => syncIndexes(error => next(error)),
        next => User.listIndexes(next),
      ],
      (error, indexes) => {
        expect(error).to.not.exist;
        expect(indexes).to.exist;
        expect(_.find(indexes, { name: 'name_1' })).to.exist;
        done(error, indexes);
      }
    );
  });
});
