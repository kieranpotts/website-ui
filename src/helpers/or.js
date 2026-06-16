'use strict'

/**
 * Returns the first truthy argument, or the last argument if none are truthy.
 * The trailing Handlebars options object is sliced off first.
 */
module.exports = (...args) => args.slice(0, -1).find(Boolean)
