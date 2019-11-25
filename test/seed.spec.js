'use strict';

const _ = require('lodash');
const { waterfall } = require('async');
const { expect, faker } = require('@lykmapipo/test-helpers');
const { ObjectId, createModel, connect, drop } = require('..');

describe('seed', () => {
  before(done => connect(done));
  after(done => drop(done));

  it('should work when no seeds passed', done => {
    const User = createModel({ name: { type: String } });
    User.seed((error, seeded) => {
      expect(error).to.not.exist;
      done(error, seeded);
    });
  });

  it('should work when single seeds passed', done => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } });
    User.seed(user, (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should work when array seeds passed', done => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } });
    User.seed([user], (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should upsert if seed exists', done => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } });
    User.seed([user], (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.have.length(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should use model `prepareSeedCriteria`', done => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } }, {}, schema => {
      schema.statics.prepareSeedCriteria = data => {
        expect(data).to.be.eql(user);
        return data;
      };
    });
    User.seed([user], (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.have.length(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should work using seeds path', done => {
    process.env.BASE_PATH = __dirname;
    const User = createModel({ name: { type: String } }, { modelName: 'User' });
    User.seed((error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      done(error, seeded);
    });
  });

  it('should clear and seed using seeds path', done => {
    process.env.BASE_PATH = __dirname;
    const User = createModel({ name: { type: String } }, { modelName: 'User' });
    User.clearAndSeed((error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      done(error, seeded);
    });
  });

  it('should ignore path seeds if seed provided', done => {
    process.env.BASE_PATH = __dirname;
    const User = createModel({ name: { type: String } }, { modelName: 'User' });
    const user = { name: faker.name.findName() };
    User.seed([user], (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.have.length(1);
      expect(_.first(seeded).name).to.be.equal(user.name);
      done(error, seeded);
    });
  });

  it('should work with refs', done => {
    const Parent = createModel({ name: { type: String } });
    const Child = createModel({
      name: { type: String },
      parent: { type: ObjectId, ref: Parent.modelName },
    });

    const child = { name: faker.name.findName() };
    const parent = { name: faker.name.findName() };

    waterfall(
      [
        next => Parent.seed(parent, next),
        (parents, next) => {
          child.parent = _.sample(parents);
          Child.seed(child, next);
        },
      ],
      (error, seeded) => {
        expect(error).to.not.exist;
        expect(seeded).to.length.at.least(1);
        done(error, seeded);
      }
    );
  });

  it('should work with populate', done => {
    const Parent = createModel({ name: { type: String } });
    const Child = createModel({
      name: { type: String },
      parent: { type: ObjectId, ref: Parent.modelName },
    });

    const parent = { name: faker.name.findName() };
    const child = {
      name: faker.name.findName(),
      populate: {
        parent: { model: Parent.modelName, match: parent },
      },
    };

    waterfall(
      [
        next => Parent.seed(parent, next),
        (parents, next) => {
          Child.seed(child, next);
        },
      ],
      (error, seeded) => {
        expect(error).to.not.exist;
        expect(seeded).to.length.at.least(1);
        expect(_.first(seeded).parent).to.exist;
        expect(_.first(seeded).parent.name).to.be.equal(parent.name);
        done(error, seeded);
      }
    );
  });

  afterEach(() => {
    delete process.env.BASE_PATH;
    delete process.env.SEED_PATH;
  });
});
