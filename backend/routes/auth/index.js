import express from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator/check';

import PersistentStorage from '../../persistentStorage';
import { frontendAddress } from '../../serverConfig';
import { mapUserEntity, mapSocialProfile } from './mappings';

import initLocal from './local';
import initGoogle from './google';
import initFacebook from './facebook';
import initTwitter from './twitter';

const router = express.Router();
const persistentStorage = new PersistentStorage();

router.get('/whoami', function(req, res) {
  if (req.user) {
    res.json(mapUserEntity(req.user));
  }
  else {
    res.status(401).end();
  }
});

router.post('/signup', [
  check('username').exists(),
  check('password').isLength({ min: 3 }),
  check('displayName').exists()
], (req, res) => {
  const { username, password, displayName } = req.body;

  const errors = validationResult(req);
  if (! errors.isEmpty()) {
    return res
      .status(422)
      .json({ errors: errors.array() });
  }

  persistentStorage.addUserWithCredentials(username, password, {
    displayName
  })
    .then(user => {
      console.log('Added new user', user.entityKey.id);
      res.json(mapUserEntity(user));
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        errors: [err]
      });
    });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.json({
    success: true
  });
});

router.post('/recovery', (req, res) => {
  const { email } = req.body;

  // mockup data for test
  if (email === 'admin@tenantId.com') {
    res.status(200).json({
      ok: true,
    });
  } else {
    res.status(200).json({
      ok: false,
      reason: 1,
      error: 'There is no user with this email',
    });
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.entityKey.id);
});

passport.deserializeUser(function(id, done) {
  persistentStorage.findUserById(id).then(user => {
    done(null, user);
  }).catch(err => {
    done(err, null);
  });
});

initLocal(passport, router, persistentStorage);
initGoogle(passport, router, verifyCallback);
initTwitter(passport, router, verifyCallback);
initFacebook(passport, router, verifyCallback);

function verifyCallback (accessToken, refreshToken, profile, done) {
  persistentStorage.findUserBySocialId(profile.provider, profile.id)
    .then(user => done(null, user))
    .catch(err => {
      persistentStorage.addUserWithSocial(profile.provider, accessToken, refreshToken, mapSocialProfile(profile))
        .then(user => {
          console.log('Added new user', user.entityKey.id);
          done(null, user);
        })
        .catch(err => {
          console.log(err);
          done(err, false);
        });
    });
}

export default router;
