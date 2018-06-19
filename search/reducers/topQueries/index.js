import {
	REPORTS_TOP_QUERIES_REQUEST,
	REPORTS_TOP_QUERIES_REQUEST_SUCCEEDED,
	REPORTS_TOP_QUERIES_REQUEST_FAILED,
} from '../../constants/action-types';

import { REPORTS_TOP_QUERIES as initialState } from '../../state/TopQueries';

const reportsTopQueries = (state = initialState, action) => {
	switch (action.type) {
		case REPORTS_TOP_QUERIES_REQUEST: {
			return { isLoading: true, data: null, error: false };
		}
		case REPORTS_TOP_QUERIES_REQUEST_SUCCEEDED: {
			return { isLoading: false, data: action.payload, error: false };
		}
		case REPORTS_TOP_QUERIES_REQUEST_FAILED: {
			return { isLoading: false, data: null, error: true };
		}
		default:
			return state;
	}
};

export default reportsTopQueries;
