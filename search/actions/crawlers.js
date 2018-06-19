import {
  CRAWLERS_REQUEST,
  CRAWLERS_REQUEST_ADD,
  CRAWLERS_REQUEST_FAILED,
  CRAWLERS_REQUEST_GET,
  CRAWLERS_REQUEST_REMOVE,
  CRAWLERS_REQUEST_SUCCEEDED
} from '../constants/action-types';
import { makeQuery } from '../api';

const requestCrawlers = () => ({ type: CRAWLERS_REQUEST });
const requestCrawlersFailed = () => ({ type: CRAWLERS_REQUEST_FAILED });
const requestCrawlersRemove = () => ({ type: CRAWLERS_REQUEST_REMOVE });
const requestCrawlersGet = (data) => ({ type: CRAWLERS_REQUEST_GET, payload: data });
const requestCrawlersSucceeded = (data) => ({ type: CRAWLERS_REQUEST_SUCCEEDED, payload: data });
const requestCrawlersAdd = (data) => ({ type: CRAWLERS_REQUEST_ADD, payload: data });

/**
 * @param {Object} dispatch redux object from `this.props` of component
 */
export const fetchCrawlers = (dispatch) => {
	dispatch(requestCrawlers());

	return new Promise((resolve, reject) => {
		makeQuery('/crawlers')
			.then((res) => {
				const data = Object.keys(res).map((value) => ({ ...res[value] }));
				dispatch(requestCrawlersSucceeded(data));

				resolve();
			})
			.catch((error) => {
				reject(error);
				dispatch(requestCrawlersFailed());
			});
	});
};

export const addCrawler = (dispatch, data) => {
	return new Promise((resolve, reject) => {
		makeQuery(`/crawlers/${data.name}`, 'PUT', data)
			.then((res) => {
				dispatch(requestCrawlersAdd(data));
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const removeCrawler = (dispatch, name) => {
	return new Promise((resolve, reject) => {
		makeQuery(`/crawlers/${name}`, 'DELETE')
			.then((res) => {
				dispatch(requestCrawlersRemove());
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export const getCrawler = (dispatch, name) => {
	return new Promise((resolve, reject) => {
		makeQuery(`/crawlers/${name}`)
			.then((res) => {
				const key = Object.keys(res)[0];
				const collection = res[key];

				dispatch(requestCrawlersGet(collection));
				resolve();
			})
			.catch((error) => {
				reject(error);
			});
	});
};
