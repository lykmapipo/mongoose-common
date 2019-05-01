'use strict';


/* dependencies */
const _ = require('lodash');
const { expect, faker } = require('@lykmapipo/test-helpers');
const { include } = require('@lykmapipo/include');
const {
  createModel,
  connect,
  drop
} = include(__dirname, '..');

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

});