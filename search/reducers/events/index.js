import {
	EVENTS_STATS_REQUEST,
	EVENTS_STATS_REQUEST_SUCCEEDED,
	EVENTS_STATS_REQUEST_FAILED,
} from '../../constants/action-types';

import { REPORT_SEARCH_STATS as initialState } from '../../state/ReportSearchStats';

const reportsSearchStats = (state = initialState, action) => {
	switch (action.type) {
		case EVENTS_STATS_REQUEST: {
			return { isLoading: true, data: null, error: false };
		}
		case EVENTS_STATS_REQUEST_SUCCEEDED: {
			const hist = action.payload.histogram.buckets;
			const data = {
				labels: [],
				docCount: [],
				api: [],
				error: [],
			};

			hist.forEach((val, index) => {
				data.labels[index] = val.key_as_string.split('T')[0];
				data.docCount[index] = val.doc_count;
				data.api[index] = val.types.buckets.length > 0 ? val.types.buckets[0].doc_count : 0;
				data.error[index] = val.types.buckets.length > 0 ? val.types.buckets[1].doc_count : 0;
			});

			return { isLoading: false, data, error: false };
		}
		case EVENTS_STATS_REQUEST_FAILED: {
			return { isLoading: false, data: null, error: true };
		}
		default:
			return state;
	}
};

export default reportsSearchStats;
