
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var BadRequest = integration.errors.BadRequest;
var mapper = require('./mapper');

/**
 * Expose `Klaviyo`
 */

var Klaviyo = module.exports = integration('Klaviyo')
  .endpoint('http://a.klaviyo.com/api')
  .mapper(mapper)
  .retries(2);

/**
 * Validate.
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Klaviyo}
 * @api public
 */

Klaviyo.prototype.validate = function(_, settings){
  return this.ensure(settings.apiKey, 'apiKey');
};

/**
 * Identify.
 *
 * https://www.klaviyo.com/docs
 *
 * @param {Object} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Klaviyo.prototype.identify = request('/identify');

/**
 * Track.
 *
 * https://www.klaviyo.com/docs
 *
 * @param {Object} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Klaviyo.prototype.track = request('/track');

/**
 * Check klaviyo's request.
 *
 * @param {Function} fn
 * @api private
 */

Klaviyo.prototype.check = function(fn){
  return this.handle(function(err, res){
    if (err) return fn(err);
    if ('1' != res.text) err = new BadRequest('bad klaviyo response');
    return fn(err, res);
  });
};

/**
 * Create request for `path`.
 *
 * @param {String} path
 * @return {Function}
 * @api private
 */

function request(path){
  return function(payload, _, fn){
    payload = JSON.stringify(payload);
    payload = new Buffer(payload).toString('base64');
    return this
      .get(path)
      .query({ data: payload })
      .end(this.check(fn));
  };
}
