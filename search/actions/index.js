// TODO: Refactor and encapsulate function in separated modules
import {
	REPORTS_SEARCH_STATS_REQUEST,
	REPORTS_SEARCH_STATS_REQUEST_SUCCEEDED,
	REPORTS_SEARCH_STATS_REQUEST_FAILED,
	REPORTS_TOP_QUERIES_REQUEST,
	REPORTS_TOP_QUERIES_REQUEST_SUCCEEDED,
	REPORTS_TOP_QUERIES_REQUEST_FAILED,
	SERVER_STATS_REQUEST,
	SERVER_STATS_REQUEST_FAILED,
	SERVER_STATS_REQUEST_SUCCEEDED,
} from '../constants/action-types';

import { makeQuery } from '../api';

/**
 * Search stats redux actions
 */
const requestReportsSearchStats = () => ({ type: REPORTS_SEARCH_STATS_REQUEST });
const requestReportsSearchStatsSuccess = (data) => ({ type: REPORTS_SEARCH_STATS_REQUEST_SUCCEEDED, payload: data });
const requestReportsSearchStatsFail = () => ({ type: REPORTS_SEARCH_STATS_REQUEST_FAILED });

/**
 * @param {Object} dispatch redux object from `this.props` of component
 */
export const fetchReportsSearchStats = (dispatch) => {
	dispatch(requestReportsSearchStats());

	return new Promise((resolve, reject) => {
		makeQuery('/reports/search-stats')
			.then((res) => {
				const { collections, hits_percentiles, queries_by_time } = res;
				const hitsPercentage = {
					labels: Object.keys(hits_percentiles).map((val) => `${val}%`),
					dataset: Object.values(hits_percentiles).map((val) => parseInt(val, 10)),
				};

				const countDocsCollections = {
					labels: Object.keys(collections).map((val) => collections[val].key),
					dataset: Object.keys(collections).map((val) => collections[val].doc_count),
				};

				const queriesByDates = {
					labels: Object.keys(queries_by_time).map((val) => queries_by_time[val].key_as_string.split('T')[0]),
					dataset: Object.keys(queries_by_time).map((val) => queries_by_time[val].doc_count),
				};

				dispatch(
					requestReportsSearchStatsSuccess({
						hitsPercentage,
						countDocsCollections,
						queriesByDates,
					})
				);

				resolve();
			})
			.catch((error) => {
				reject(error);
				dispatch(requestReportsSearchStatsFail());
			});
	});
};

/**
 * Top queries redux actions
 */
const requestReportsTopQueries = () => ({ type: REPORTS_TOP_QUERIES_REQUEST });
const requestReportsTopQueriesSuccess = (data) => ({ type: REPORTS_TOP_QUERIES_REQUEST_SUCCEEDED, payload: data });
const requestReportsTopQueriesFail = () => ({ type: REPORTS_TOP_QUERIES_REQUEST_FAILED });

/**
 * @param {Object} dispatch redux object from `this.props` of component
 */
export const fetchReportsTopQueries = (dispatch) => {
	dispatch(requestReportsTopQueries());

	return new Promise((resolve, reject) => {
		makeQuery('/reports/top-queries')
			.then((res) => {
				const data = Object.keys(res)
					.map((val) => ({
						keyword: val,
						doc_count: res[val],
					}))
					.sort((a, b) => b.value - a.value);

				dispatch(requestReportsTopQueriesSuccess(data));

				resolve();
			})
			.catch((error) => {
				reject(error);
				dispatch(requestReportsTopQueriesFail());
			});
	});
};

/**
 * Top queries redux actions
 */
const requestServerStats = () => ({ type: SERVER_STATS_REQUEST });
const requestServerStatsSuccess = (data) => ({ type: SERVER_STATS_REQUEST_SUCCEEDED, payload: data });
const requestServerStatsFail = () => ({ type: SERVER_STATS_REQUEST_FAILED });

/**
 * @param {Object} dispatch redux object from `this.props` of component
 */
export const fetchServerStats = (dispatch) => {
	dispatch(requestServerStats());

	return new Promise((resolve, reject) => {
		makeQuery('/stats/elasticsearch/nodes')
			.then((res) => {
				let data = {
					server: res.nodes[0],
					collections: null,
				};

				makeQuery('/stats/collections').then(colResp => {
					data.collections = colResp;

					dispatch(requestServerStatsSuccess(data));
					resolve();
				}).catch((error) => {
					reject(error);
					dispatch(requestServerStatsFail());
				});
			})
			.catch((error) => {
				reject(error);
				dispatch(requestServerStatsFail());
			});
	});
};
