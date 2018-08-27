var url = require('url')
  , util = require('util')
  , AuthorizationError = require('passport-oauth2/lib/errors/authorizationerror')
  , request = require('superagent')
  , Profile = require('./profile')
  , channelApiYd = require('./channelApiYd')
  ;

exports.authenticate = function (req, options) {
  options = options || {};
  var self = this;
  if (req.query) {
    if (req.query.error) {
      if (req.query.error == 'access_denied') {
        return this.fail({
          message: req.query.error_description
        });
      } else {
        return this.error(new AuthorizationError(req.query.error_description, req.query.error, req.query.error_uri));
      }
    } else if (!req.query.code) {
      return this.fail({
        message: 'no code'
      });
    }
  } else {
    return this.fail({
      message: 'no code'
    });
  }

  var params = {
    user_id: req.query.user_id,
    sid: req.query.sid,
    url: self._userProfileURL,
    sign: self._secret,
  };
  channelApiYd.getUserInfo(params, (err, res)=>{

    if (err) {
      return self.error(self._createOAuthError('Failed to obtain session_key', err));
    }

    var profile = res;// Profile.parse(res.body);
    profile.provider = 'yd';
    profile._json = res.body;

    function verified(err, user, info) {
      if (err) {
        return self.error(err);
      }
      if (!user) {
        return self.fail(info);
      }
      self.success(user, info);
    }

    try {
      if (self._passReqToCallback) {
        var arity = self._verify.length;
        if (arity == 6) {
          self._verify(req, null, null, params, profile, verified);
        } else { // arity == 5
          self._verify(req, null, null, profile, verified);
        }
      } else {
        var arity = self._verify.length;
        if (arity == 5) {
          self._verify(null, null, params, profile, verified);
        } else { // arity == 4
          self._verify(null, null, profile, verified);
        }
      }
    } catch (ex) {
      return self.error(ex);
    }

  });
}
