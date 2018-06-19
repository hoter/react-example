import { QUOTA_REQUEST, QUOTA_REQUEST_FAILED, QUOTA_REQUEST_SUCCEEDED } from '../constants/action-types';

import { makeQueryToApi } from '../api';

const requestQuota = () => ({ type: QUOTA_REQUEST });
const requestQuotaFailed = () => ({ type: QUOTA_REQUEST_FAILED });
const requestQuotaSucceeded = (data) => ({ type: QUOTA_REQUEST_SUCCEEDED, payload: data });

export const fetchQuotaData = (dispatch) => {
	dispatch(requestQuota());

	makeQueryToApi('/quotas')
		.then((resp) => {
			if (resp) {
				dispatch(requestQuotaSucceeded(resp));
			} else {
				dispatch(requestQuotaFailed());
			}
		})
		.catch((error) => dispatch(requestQuotaFailed()));
};
