import passport from 'passport';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import { FACEBOOK_AUTH, frontendAddress } from '../../serverConfig';

export default function (passport, router, verifyCallback) {
  passport.use(new FacebookStrategy({
    clientID: FACEBOOK_AUTH.clientID,
    clientSecret: FACEBOOK_AUTH.clientSecret,
    callbackURL: '/api/auth/facebook/callback'
  }, verifyCallback));

  router.get('/facebook', passport.authenticate('facebook'));
  router.get('/facebook/callback', passport.authenticate('facebook'), function(req, res) {
    res.redirect(frontendAddress());
  });
};