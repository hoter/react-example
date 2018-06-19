// TODO: Refactor and encapsulate function in separated modules
import {
	COLLECTIONS_REQUEST,
	COLLECTIONS_REQUEST_ADD,
	COLLECTIONS_REQUEST_GET,
	COLLECTIONS_REQUEST_FAILED,
	COLLECTIONS_REQUEST_REMOVE,
	COLLECTIONS_REQUEST_SUCCEEDED,
	COLLECTIONS_REQUEST_UPDATE,
} from '../constants/action-types';

import { makeQuery } from '../api';

const requestCollections = () => ({ type: COLLECTIONS_REQUEST });
const requestCollectionsFailed = () => ({ type: COLLECTIONS_REQUEST_FAILED });
const requestCollectionsRemove = () => ({ type: COLLECTIONS_REQUEST_REMOVE });
const requestCollectionsGet = (data) => ({ type: COLLECTIONS_REQUEST_GET, payload: data });
const requestCollectionsSucceeded = (data) => ({ type: COLLECTIONS_REQUEST_SUCCEEDED, payload: data });
const requestCollectionsAdd = (data) => ({ type: COLLECTIONS_REQUEST_ADD, payload: data });
const requestCollectionsUpdate = (data) => ({ type: COLLECTIONS_REQUEST_UPDATE, payload: data });

/**
 * @param {Object} dispatch redux object from `this.props` of component
 */
export const fetchCollections = (dispatch) => {
	dispatch(requestCollections());

	makeQuery('/collections')
		.then((res) => {
			const data = Object.keys(res).map(key => ({ ...res[key], key }));
			dispatch(requestCollectionsSucceeded(data));
		})
		.catch((error) => {
			dispatch(requestCollectionsFailed());
		});
};

export const addCollection = (dispatch, data) => {
	dispatch(requestCollections());

	makeQuery(`/collections/${data.name}`, 'POST', data)
		.then((res) => {
			dispatch(requestCollectionsAdd(data));
		})
		.catch((error) => {
			console.log(error);
		});
};

export const updateCollection = (dispatch, data) => {
	dispatch(requestCollections());

	makeQuery(`/collections/${data.name}`, 'PUT', data)
		.then((res) => {
			dispatch(requestCollectionsUpdate(data));
		})
		.catch((error) => {
			console.log(error);
		});
};

export const removeCollection = (dispatch, name) => {
	dispatch(requestCollections());

	makeQuery(`/collections/${name}`, 'DELETE')
		.then((res) => {
			dispatch(requestCollectionsRemove());
		})
		.catch((error) => {
			console.log(error);
		});
};

export const getCollection = (dispatch, name) => {
	dispatch(requestCollections());

	makeQuery(`/collections`) // todo: need api request for getting only one collection by name
		.then((res) => {
			if (name in res) {
				dispatch(requestCollectionsGet({ ...res[name], key: name }));
			}
			else {
				throw "No such collection " + name;
			}
		})
		.catch((error) => {
			console.log(error);
		});
};