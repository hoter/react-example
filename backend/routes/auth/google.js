import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { GOOGLE_OAUTH, frontendAddress } from '../../serverConfig';

export default function (passport, router, verifyCallback) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_OAUTH.clientID,
    clientSecret: GOOGLE_OAUTH.clientSecret,
    callbackURL: '/api/auth/google/callback'
  }, verifyCallback));

  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force',
  }));

  router.get('/google/callback', passport.authenticate('google'), function(req, res) {
    res.redirect(frontendAddress());
  });
};
