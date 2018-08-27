/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , querystring= require('querystring')
  , yd = require('./yd')
  ;


/**
 * `Strategy` constructor.
 *
 * The weixin authentication strategy authenticates requests by delegating to
 * weixin using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your weixin application's Client ID
 *   - `clientSecret`  your weixin application's Client Secret
 *   - `callbackURL`   URL to which weixin will redirect the user after granting authorization
 *   - `scope`         valid scopes include:
 *                     'snsapi_base', 'snsapi_login'.
 *                     (see http://developer.github.com/v3/oauth/#scopes for more info)
 *   — `userAgent`     optional, you can set your own userAgent
 *
 * Examples:
 *
 *     passport.use(new WeixinStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/weixin/callback',
 *         userAgent: 'myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};
  options.scope = options.scope || 'snsapi_login';

  this.name = 'yd';
  this._appid = options.clientID;
  this._secret = options.clientSecret;
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
  this._requireState = options.requireState === undefined ? true : options.requireState;
  this._authorizationURL = options.authorizationURL;
  this._userProfileURL = options.userProfileURL;

  this.authenticate = yd.authenticate;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Different with passport-oauth2‘s method 'getAuthorizeUrl', Weixin not include param 'client_id'
 * @param params
 * @returns {string}
 */
Strategy.prototype.getAuthorizeUrl= function(params) {
  // sort params base the doc: http://mp.weixin.qq.com/wiki/9/01f711493b5a02f24b04365ac5d8fd95.html
  // and ignore the other unnecessary params;
  var queries = [];
  // add all necessary params by order here
  var order = ['appid', 'redirect_uri', 'response_type', 'scope', 'state'];
  order.forEach(function(key) {
    if(params[key]) {
      var query = {};
      query[key] = params[key];
      queries.push(querystring.stringify(query));
    }
  });
  return this._authorizationURL + '?' + queries.join('&');
};

Strategy.prototype.authorizationParams = function(options){
  options.appid = this._appid;
  if(this._requireState && !options.state){
    throw new Error('Authentication Parameter `state` Required');
  }else{
    return options;
  }
};

Strategy.prototype.tokenParams = function(options){
  options.appid = this._appid;
  options.secret = this._secret;
  return options;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
