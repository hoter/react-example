import passport from 'passport';
import {Strategy as TwitterStrategy} from 'passport-twitter';
import { TWITTER_AUTH, frontendAddress } from '../../serverConfig';

export default function (passport, router, verifyCallback) {
  passport.use(new TwitterStrategy({
    consumerKey: TWITTER_AUTH.consumerKey,
    consumerSecret: TWITTER_AUTH.consumerSecret,
    callbackURL: '/api/auth/twitter/callback'
  }, verifyCallback));

  router.get('/twitter', passport.authenticate('twitter'));
  router.get('/twitter/callback', passport.authenticate('twitter'), function(req, res) {
    res.redirect(frontendAddress());
  });    
}