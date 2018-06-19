import { ESSTATUS_REQUEST, ESSTATUS_REQUEST_SUCCEEDED, ESSTATUS_REQUEST_FAILED } from '../constants/action-types';

import { makeQueryToApi } from '../api';

const requestESStatus = () => ({ type: ESSTATUS_REQUEST });
const requestESStatusFailed = () => ({ type: ESSTATUS_REQUEST_FAILED });
const requestESStatusSucceeded = () => ({ type: ESSTATUS_REQUEST_SUCCEEDED });

export const pingElasticStatus = (dispatch) => {
	dispatch(requestESStatus());

	makeQueryToApi('/status')
		.then((resp) => {
			if (resp.ok) {
				dispatch(requestESStatusSucceeded());
			} else {
				dispatch(requestESStatusFailed());
			}
		})
		.catch((error) => dispatch(requestESStatusFailed()));
};
