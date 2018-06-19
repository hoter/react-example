import { ESSTATUS_REQUEST, ESSTATUS_REQUEST_FAILED, ESSTATUS_REQUEST_SUCCEEDED } from '../../constants/action-types';

import { ES_STATUS as initialState } from '../../state/ESStatus';

const esStatusReducer = (state = initialState, action) => {
	switch (action.type) {
		case ESSTATUS_REQUEST: {
			return { status: 'checking' };
		}
		case ESSTATUS_REQUEST_FAILED: {
			return { status: 'failed' };
		}
		case ESSTATUS_REQUEST_SUCCEEDED: {
			return { status: 'available' };
		}
		default:
			return state;
	}
};

export default esStatusReducer;
