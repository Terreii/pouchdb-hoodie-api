module.exports = update

var Promise = require('lie')

var updateOne = require('./helpers/update-one')
var updateMany = require('./helpers/update-many')

/**
 * updates existing object.
 *
 * @param  {String}          prefix       optional id prefix
 * @param  {String|Object}   idOrObject   id or object with `.id` property
 * @param  {Object|Function} [change]     Changed properties or function
 *                                        that changes existing object
 * @return {Promise}
 */
function update (prefix, objectsOrIds, change) {
  if (typeof objectsOrIds !== 'object' && !change) {
    return Promise.reject(
      new Error('Must provide change')
    )
  }

  return Array.isArray(objectsOrIds)
    ? updateMany.call(this, objectsOrIds, change, prefix)
    : updateOne.call(this, objectsOrIds, change, prefix)
}
