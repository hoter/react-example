import {
	COLLECTIONS_REQUEST,
	COLLECTIONS_REQUEST_FAILED,
	COLLECTIONS_REQUEST_SUCCEEDED,
	COLLECTIONS_REQUEST_ADD,
	COLLECTIONS_REQUEST_REMOVE,
	COLLECTIONS_REQUEST_GET,
} from '../../constants/action-types';

import { COLLECTIONS as initialState } from '../../state/Collections';

const collections = (state = initialState, action) => {
	switch (action.type) {
		case COLLECTIONS_REQUEST: {
			return { ...state, isLoading: true, data: null, error: false, get: null };
		}
		case COLLECTIONS_REQUEST_SUCCEEDED: {
			return { ...state, isLoading: false, data: action.payload, error: false };
		}
		case COLLECTIONS_REQUEST_FAILED: {
			return { ...state, isLoading: false, data: null, error: true,};
		}
		case COLLECTIONS_REQUEST_GET: {
			return { ...state, isLoading: false, get: action.payload }
		}
		case COLLECTIONS_REQUEST_ADD: {
			return state;
		}
		case COLLECTIONS_REQUEST_REMOVE: {
			return state;
		}
		default:
			return state;
	}
};

export default collections;
