'use strict';


/* set environment variables */
process.env.NODE_ENV = 'test';


/* dependencies */
const { include } = require('@lykmapipo/include');
const { expect } = require('chai');
const { SCHEMA_OPTIONS, SUB_SCHEMA_OPTIONS } = include(__dirname, '..');
const { connect, disconnect } = include(__dirname, '..');
const { clear, drop, model } = include(__dirname, '..');


describe.only('mongoose-common', () => {

  const MONGODB_URI = 'mongodb://localhost/mongoose-common';

  beforeEach(done => disconnect(done));
  afterEach(done => drop(done));

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
    expect(model.length).to.be.equal(2);
  });

  it('should be able to drop', () => {
    expect(drop).to.exist;
    expect(drop).to.be.a('function');
    expect(drop.name).to.be.equal('drop');
    expect(drop.length).to.be.equal(1);
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

});