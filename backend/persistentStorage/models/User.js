import _ from 'lodash';

const gstore = require('gstore-node')();
const { Schema } = gstore;

const allowedProviders = ['local', 'google', 'facebook', 'twitter'];

const User = gstore.model('User', new Schema({
  createdOn: { type: String, default: gstore.defaultValues.NOW, write: false, read: false },
	displayName: { type: String, required: true },
	tenantId: { type: String, required: true },
	auth: {
		validate: { rule: validateAuth }
	}
}));

function validateAuth(auth, validator) {
	for (const providerName in auth) {
		if (! allowedProviders.includes(providerName)) {
			return false;
		}
	}

	let isValid = true;

	_.forOwn(auth, (providerData, providerName) => {
		if (providerName == 'local') {
			isValid &= !! (auth.local.username);
			isValid &= !! (auth.local.passwordHash);
		}
		else {
			isValid &= !! (providerData.id);
			isValid &= !! (providerData.accessToken);
		}
	});

	return isValid;
}

export default User;