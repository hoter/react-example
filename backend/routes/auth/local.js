import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { mapUserEntity } from './mappings';

export default function (passport, router, persistentStorage) {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      persistentStorage.findUserByCredentials(username, password)
        .then(user => done(null, user))
        .catch(err => {
            done(null, false, { message: err })
        })
    }
  ));

  router.post('/local', passport.authenticate('local'), function(req, res) {
    res.json(mapUserEntity(req.user))
  });
};