import Datastore from '@google-cloud/datastore';
import Gstore from 'gstore-node';
import bcrypt from 'bcrypt';
import path from 'path';

import User from './models/User';

export default class PersistentStorage {
	constructor() {
		this.datastore = new Datastore({
			keyFilename: path.join(__dirname, 'data.json')
		});
		this.gstore = Gstore();
		this.gstore.connect(this.datastore);

		this.addUserWithSocial = this.addUserWithSocial.bind(this);
		this.addUserWithCredentials = this.addUserWithCredentials.bind(this);
		this.findUserById = this.findUserById.bind(this);
		this.findUserBySocialId = this.findUserBySocialId.bind(this);
	}

	addUserWithSocial (provider, accessToken, refreshToken, profile) {
		const data = User.sanitize({
			displayName: profile.displayName,
			tenantId: 'tenantId',
			auth: {
				[provider]: {
					id: profile.id,
					accessToken,
					refreshToken
				}
			}
		});

		const user = new User(data);
		return user.save();
	}

	addUserWithCredentials (username, password, profile) {
		const passwordHash = bcrypt.hashSync(password, 10);
		const data = User.sanitize({
			displayName: profile.displayName,
			tenantId: 'tenantId',
			auth: {
				local: {
					username,
					passwordHash
				}
			}
		});

		const user = new User(data);
		return user.save();
	}

	findUserById (id) {
		return User.get(id)
	}		

	findUserByCredentials (username, password) {
		return new Promise((resolve, reject) => {
			User.findOne({ 'auth.local.username': username })
				.then(user => {
					if (bcrypt.compareSync(password, user.entityData.auth.local.passwordHash)) {
						return resolve(user);
					}
					reject('Invalid password');
				})
				.catch(err => {
					reject(err);
				});
		});
	}

	findUserBySocialId (provider, id) {
		return User.findOne({ [`auth.${provider}.id`]: id });
	}
}
