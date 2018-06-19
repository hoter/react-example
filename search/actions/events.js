import {
	EVENTS_STATS_REQUEST,
	EVENTS_STATS_REQUEST_SUCCEEDED,
	EVENTS_STATS_REQUEST_FAILED,
} from '../constants/action-types';

import { makeQuery } from '../api';

const requestEventsStats = () => ({ type: EVENTS_STATS_REQUEST });
const requestEventsStatsFailed = () => ({ type: EVENTS_STATS_REQUEST_FAILED });
const requestEventsStatsSucceeded = (data) => ({ type: EVENTS_STATS_REQUEST_SUCCEEDED, payload: data });

export const fetchEventsStats = (dispatch) => {
	dispatch(requestEventsStats());
	makeQuery('/stats/events')
		.then((res) => {
			if (res) {
				dispatch(requestEventsStatsSucceeded(res));
			} else {
				dispatch(requestEventsStatsFailed());
			}
		})
		.catch((error) => dispatch(requestEventsStatsFailed()));
};
