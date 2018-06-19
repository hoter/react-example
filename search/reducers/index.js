import { combineReducers } from 'redux';

/**
 * Reducers
 */
import searchStats from './reportsSearchStats';
import topQueries from './topQueries';
import collections from './collections';
import eventsStats from './events';
import serverStatus from './serverStatus';
import crawlers from './crawlers';
import esStatus from './esStatus';
import quota from './quota';
import users from './user';

const rootReducer = combineReducers({
	serverStatus,
	searchStats,
	eventsStats,
	collections,
	topQueries,
	crawlers,
	esStatus,
	quota,
	users,
});

export default rootReducer;
