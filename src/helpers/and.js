'use strict'

/**
 * Logical AND over all arguments. Handlebars passes an options object as the
 * final argument, which is truthy, so it is sliced off before reducing.
 */
module.exports = (...args) => args.slice(0, -1).every(Boolean)
