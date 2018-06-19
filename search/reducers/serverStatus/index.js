import {
  SERVER_STATS_REQUEST,
  SERVER_STATS_REQUEST_SUCCEEDED,
  SERVER_STATS_REQUEST_FAILED,
} from '../../constants/action-types';

import { SERVER_STATUS as initialState } from '../../state/ServerStatus';

const serverStatus = (state = initialState, action) => {
	switch (action.type) {
		case SERVER_STATS_REQUEST: {
			return { isLoading: true, data: null, error: false };
		}
		case SERVER_STATS_REQUEST_SUCCEEDED: {
			return { isLoading: false, data: action.payload, error: false };
		}
		case SERVER_STATS_REQUEST_FAILED: {
			return { isLoading: false, data: null, error: true };
		}
		default:
			return state;
	}
};

export default serverStatus;
