'use strict';

const _ = require('lodash');
const { waterfall } = require('async');
const { expect, faker } = require('@lykmapipo/test-helpers');
const { ObjectId, createModel, connect, drop } = require('..');

describe('seed', () => {
  before((done) => connect(done));
  after((done) => drop(done));

  it('should work when no seeds passed', (done) => {
    const User = createModel({ name: { type: String } });
    User.seed((error, seeded) => {
      expect(error).to.not.exist;
      done(error, seeded);
    });
  });

  it('should work when single seeds passed', (done) => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } });
    User.seed(user, (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should work when array seeds passed', (done) => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } });
    User.seed([user], (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should upsert if seed exists', (done) => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } });
    User.seed([user], (error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.have.length(1);
      expect(_.find(seeded, user)).to.exist;
      done(error, seeded);
    });
  });

  it('should use model `prepareSeedCriteria`', (done) => {
    const user = { name: faker.name.findName() };
    const User = createModel({ name: { type: String } }, {}, (schema) => {
      schema.statics.prepareSeedCriteria = (data) => {
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

  it('should work using seeds path', (done) => {
    process.env.BASE_PATH = __dirname;
    const User = createModel({ name: { type: String } }, { modelName: 'User' });
    User.seed((error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      done(error, seeded);
    });
  });

  it('should clear and seed using seeds path', (done) => {
    process.env.BASE_PATH = __dirname;
    const User = createModel({ name: { type: String } }, { modelName: 'User' });
    User.clearAndSeed((error, seeded) => {
      expect(error).to.not.exist;
      expect(seeded).to.length.at.least(1);
      done(error, seeded);
    });
  });

  it('should ignore path seeds if seed provided', (done) => {
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

  it('should work with refs', (done) => {
    const Parent = createModel({ name: { type: String } });
    const Child = createModel({
      name: { type: String },
      parent: { type: ObjectId, ref: Parent.modelName },
    });

    const child = { name: faker.name.findName() };
    const parent = { name: faker.name.findName() };

    waterfall(
      [
        (next) => Parent.seed(parent, next),
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

  it('should work with populate and ignore', (done) => {
    const Parent = createModel({ name: { type: String } });
    const Child = createModel({
      name: { type: String },
      parent: { type: ObjectId, ref: Parent.modelName },
      guardian: { type: ObjectId, ref: Parent.modelName },
      brothers: { type: [ObjectId], ref: Parent.modelName },
      relatives: { type: [ObjectId], ref: Parent.modelName },
    });

    const parent = { name: faker.name.findName() };
    const guardian = { name: faker.name.findName() };
    const relatives = [
      { name: faker.name.findName() },
      { name: faker.name.findName() },
    ];
    const child = {
      name: faker.name.findName(),
      populate: {
        parent: { model: Parent.modelName, match: parent, select: { name: 1 } },
        guardian: {
          model: Parent.modelName,
          match: guardian,
          select: { name: 1 },
        },
        brothers: {
          model: Parent.modelName,
          match: { name: { $in: _.map([guardian], 'name') } },
          array: true,
        },
        relatives: {
          model: Parent.modelName,
          match: { name: { $in: _.map([...relatives, parent], 'name') } },
          array: true,
          ignore: { model: Parent.modelName, match: parent },
        },
      },
    };
    waterfall(
      [
        (next) => Parent.seed([...relatives, parent], next),
        (parents, next) => {
          Child.seed(child, next);
        },
      ],
      (error, seeded) => {
        expect(error).to.not.exist;
        expect(seeded).to.have.length.at.least(1);
        expect(_.first(seeded).parent).to.exist;
        expect(_.first(seeded).guardian).to.not.exist;
        expect(_.first(seeded).parent.name).to.exist;
        // expect(_.first(seeded).brothers).to.not.exist;
        expect(_.first(seeded).relatives).to.exist.and.to.have.length(2);
        done(error, seeded);
      }
    );
  });

  afterEach(() => {
    delete process.env.BASE_PATH;
    delete process.env.SEED_PATH;
  });
});
