'use strict'

var test = require('tape')

var dbFactory = require('../utils/db')
var Store = require('../../')

test('store.update() exists', function (t) {
  t.plan(1)

  var db = dbFactory()
  var store = new Store(db)

  t.is(typeof store.update, 'function', 'has method')
})

test('store.update(id, changedProperties)', function (t) {
  t.plan(3)

  var db = dbFactory()
  var store = new Store(db)

  store.add({
    id: 'exists',
    foo: 'bar'
  })

  .then(function () {
    return store.update('exists', {
      foo: 'baz'
    })
  })

  .then(function (object) {
    t.ok(object.id)
    t.ok(/^2\-/.test(object._rev), 'revision is 2')
    t.is(object.foo, 'baz', 'passes properties')
  })
})

test('store.update(id)', function (t) {
  t.plan(1)

  var db = dbFactory()
  var store = new Store(db)

  store.update('nothinghere')

  .catch(function (error) {
    t.ok(error instanceof Error, 'rejects error')
  })
})

test('store.update("unknown", changedProperties)', function (t) {
  t.plan(1)

  var db = dbFactory()
  var store = new Store(db)

  store.update('unknown', {foo: 'bar'})

  .catch(function (error) {
    t.ok(error instanceof Error, 'rejects error')
  })
})

test('store.update(id, updateFunction)', function (t) {
  t.plan(3)

  var db = dbFactory()
  var store = new Store(db)

  store.add({ id: 'exists' })

  .then(function () {
    return store.update('exists', function (object) {
      object.foo = object.id + 'bar'
    })
  })

  .then(function (object) {
    t.ok(object.id)
    t.ok(/^2-/.test(object._rev))
    t.is(object.foo, 'existsbar', 'resolves properties')
  })
})

test('store.update(object)', function (t) {
  t.plan(3)

  var db = dbFactory()
  var store = new Store(db)

  store.add({ id: 'exists' })

  .then(function () {
    return store.update({
      id: 'exists',
      foo: 'bar'
    })
  })

  .then(function (object) {
    t.ok(object.id, 'resolves with id')
    t.ok(/^2-/.test(object._rev), 'resolves with new rev number')
    t.is(object.foo, 'bar', 'resolves with properties')
  })
})

test('store.update(array)', function (t) {
  t.plan(6)

  var db = dbFactory()
  var store = new Store(db)

  store.add([
    { id: '1', foo: 'foo', bar: 'foo'},
    { id: '2', foo: 'bar'}
  ])

  .then(function () {
    return store.update([
      { id: '1', bar: 'baz'},
      { id: '2', bar: 'baz'}
    ])
  })

  .then(function (objects) {
    t.is(objects[0].id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, 'baz')

    t.is(objects[1].id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, 'baz')
  })
})

// blocked by https://github.com/boennemann/pouchdb-hoodie-api/issues/8
test.skip('store.update(array) with non-existent object', function (t) {
  t.plan(3)

  var db = dbFactory()
  var store = new Store(db)

  store.add({ id: 'exists'})

  .then(function () {
    return store.update([
      { id: 'exists', foo: 'bar'},
      { id: 'unknown', foo: 'baz'}
    ])
  })

  .then(function (objects) {
    t.is(objects[0].id, 'exists')
    t.is(objects[0].foo, 'bar')

    t.is(objects[1].status, 400)
  })
})

// https://github.com/boennemann/pouchdb-hoodie-api/issues/9
test.skip('store.update(array) with invalid objects', function (t) {
  t.plan(3)

  var db = dbFactory()
  var store = new Store(db)

  store.add(
    { id: 'exists' },
    { id: 'foo' }
  )

  .then(function () {
    return store.update([
      { id: 'exists', foo: 'bar'},
      'foo'
    ])
  })

  .then(function (objects) {
    t.is(objects[0].id, 'exists')
    t.is(objects[0].foo, 'bar')

    t.is(objects[1].status, 400)
  })
})

test('store.update(array, changedProperties)', function (t) {
  t.plan(6)

  var db = dbFactory()
  var store = new Store(db)

  store.add([
    { id: '1', foo: 'foo', bar: 'foo'},
    { id: '2', foo: 'bar'}
  ])

  .then(function () {
    return store.update([{id: '1'}, '2'], {
      bar: 'baz'
    })
  })

  .then(function (objects) {
    t.is(objects[0].id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, 'baz')

    t.is(objects[1].id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, 'baz')
  })
})

test('store.update(array, updateFunction)', function (t) {
  t.plan(6)

  var db = dbFactory()
  var store = new Store(db)

  store.add([
    { id: '1', foo: 'foo', bar: 'foo'},
    { id: '2', foo: 'bar'}
  ])

  .then(function () {
    return store.update(['1', '2'], function (object) {
      object.bar = object.id + 'baz'
    })
  })

  .then(function (objects) {
    t.is(objects[0].id, '1')
    t.is(objects[0].foo, 'foo')
    t.is(objects[0].bar, '1baz')

    t.is(objects[1].id, '2')
    t.is(objects[1].foo, 'bar')
    t.is(objects[1].bar, '2baz')
  })
})
