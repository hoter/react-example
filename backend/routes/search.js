import express from 'express';
import {es_client, logErrors} from "../server";
import _ from 'lodash';

const router = express.Router();

const PAGE_SIZE = 10;
function getFilteredAggregation(name, agg, filters) {
	const filtersToApply = [];
	for (let i = 0; i < filters.length; i++) {
		let propName = Object.getOwnPropertyNames(filters[i]);
		if (propName.length === 1 && name !== propName[0]) {
			filtersToApply.push(filters[i][propName[0]]);
		}
	}

	if (filtersToApply.length > 0) {
		let agg_filtered = name + "_filtered";
		return {
			[agg_filtered]: {
				filter: {bool: {filter: filtersToApply}},
				aggs: {[name]: agg}
			}
		};
	} else {
		return {[name]: agg};
	}
}

router.get('/:collections/:text', (req, res) => {
	const page = req.query.page || 0;
	const { collections, text } = req.params;

	/** Setup sorting */
	let sort = [];
	if (!!req.query.sortBy) {
		sort = [];
		sort.push({[sortField(req.query.sortBy)]: req.query.sort || 'desc'});
		if (!!req.query.secondarySortBy) {
			sort.push({[sortField(req.query.secondarySortBy)]: req.query.secondarySort || 'desc'});
		}
	}

	/** Setup filtering */
	// TODO make sure user has permissions to view / query those collections
	const filterQueries = [{
			terms: {
				// TODO don't even include this if all collections are selected
				collection: (collections || 'wikipedia,ynet').split(',')
			}
		},
		{term:{tenant_id: res.locals.user.tenant_id}}
	];
	const textFilter = req.query['filter_text'] ? req.query['filter_text'] : null;
	if (textFilter) {
		filterQueries.push({
			bool: {
				// TODO support NOT in addition to must/should
				should: [
					{match: {title: textFilter}},
					{match: {sub_title: textFilter}},
					{match: {content: textFilter}},
				]
			}
		});
	}

	/** Setup filters which affect aggregations exept it's own */
	const postFilterQueries = [];

	const collectionsFilter = req.query['filter_collection'] ? req.query['filter_collection'] : null;
	if (!!collectionsFilter) {
		postFilterQueries.push({
			collections: {
				terms: {
					collection: collectionsFilter.split(',')
				}
			}
		});
	}

	const dateRangeGte = req.query['filter_topic_datetime'] ? req.query['filter_topic_datetime'].split(',')[0] : null;
	const dateRangeLte = req.query['filter_topic_datetime'] ? req.query['filter_topic_datetime'].split(',')[1] : null;
	if (dateRangeLte || dateRangeGte) {
        postFilterQueries.push({
            topic_datetime: {
                range: {
                    topic_datetime: {
                        gte: dateRangeGte,
                        lte: dateRangeLte,
                        format: "YYYY-MM-DD"
                    }
                }
            }
        });
    }

	/** Execute search */
	let searchQuery = {
		index: 'tenantId*',
		type: 'doc',
		body: {
			from: page * PAGE_SIZE,
			size: PAGE_SIZE,
			query: {
				function_score: {
					gauss: {
						topic_datetime: {
							origin: "now",
							scale: "10d",
							offset: "3d",
							decay: 0.5
						}
					},
					score_mode: "multiply",
					query: {
						bool: {
							filter: filterQueries,
							must: [
								{
									simple_query_string: {
										query: text,
										fields: ["content", "title", "sub_title"], // TODO use boosts from config
										default_operator: "and",
										//flags: "ALL",
									}
								}
							],
						},
					},
				}
			},
			aggs: _.extend({},
				getFilteredAggregation("collections", {terms: {field: "collection"}}, postFilterQueries),
				getFilteredAggregation("topic_datetime", {
					date_histogram: {
						field: "topic_datetime",
						interval: "day" // TODO support changing the interval from the UI?
					}
				}, postFilterQueries)),
			highlight: {
				pre_tags: ['<span class="highlight" style="font-weight:bold;">'], // TODO make highlight color configurable
				post_tags: ['</span>'],
				fields: {
					title: {number_of_fragments: 1, fragment_size: 400},
					sub_title: {number_of_fragments: 1, fragment_size: 800},
					content: {number_of_fragments: 4, fragment_size: 400}
				}
			},
			// TODO phrase suggester?
		}
	};

	if (!!sort && sort.length > 0) {
		searchQuery.body.sort = sort;
	}
	if (!!postFilterQueries && postFilterQueries.length > 0) {
		let filtersToApply = [];
		for (let i = 0; i < postFilterQueries.length; i++) {
			let propName = Object.getOwnPropertyNames(postFilterQueries[i]);
			if (propName.length === 1) {
				filtersToApply.push(postFilterQueries[i][propName[0]]);
			}
		}
		searchQuery.body.post_filter = {bool: {filter: filtersToApply}};
	}

	// TODO execute pinned results query, and only add search results if they do not appear in pinned already

	const dateIsoString = new Date().toISOString();
	es_client.search(searchQuery).then(function (resp) {
		const {took, timed_out, hits: {total, hits}} = resp;
		const aggs = resp.aggs || resp.aggregations;
		for (const aggKey in aggs) {
			if (aggs.hasOwnProperty(aggKey)) {
				if (aggKey.endsWith("_filtered")) {
					let aggKeyProper = aggKey.substring(0, aggKey.length - 9);
					aggs[aggKeyProper] = aggs[aggKey][aggKeyProper];
					delete aggs[aggKey];
				}
			}
		}

		let new_hits = hits.map((x, index, arr) => {
			const source = x._source;
			let title = source.title, sub_title = source.sub_title, highlighted_text = '';

			if (x.highlight) {
				if (x.highlight.title && x.highlight.title.length > 0) {
					title = x.highlight.title[0];
				}
				if (x.highlight.sub_title && x.highlight.sub_title.length > 0) {
					highlighted_text += x.highlight.sub_title[0];
					sub_title = null;
				}
				if (x.highlight.content && x.highlight.content.length > 0) {
					highlighted_text += "... " + x.highlight.content.join("... ");
				}
			}

			if (!!source.text && (!highlighted_text || highlighted_text.length < 50)) {
				highlighted_text = source.text.substring(0, 300) + "... " + highlighted_text;
			}

			let image = null;
			if (source.images && source.images.length > 0) {
				image = source.images[0];
			}

			return {
				_id: x._id,
				_score: x._score,
				timestamp: source.topic_datetime,
				url: source.url,
				title: title,
				sub_title: sub_title,
				highlighted_text: highlighted_text,
				result_number: (page * PAGE_SIZE) + index,
				collection: source.collection,
				image: image,
			}
		});
		res.json({took, total, number: hits.length, hits: new_hits, facets: aggs});
		res.end();

		// TODO more granular timings

		// log query asynchronously to ES
		es_client.index({
			index: 'search-logs-' + dateIsoString.substring(0, 7),
			type: 'doc',
			body: {
				timestamp: dateIsoString,
				querystring: text,
				total_hits: total,
				tag: ['query'],
				collection: collections,
				succeeded: timed_out,
                tenant_id: res.locals.user.tenant_id,
				took: took,
				request: {
					ip: res.locals.ip,
				}
			}
		}, function (error, response) {
			console.error(error);
		});

	}, function (err) {
		console.error(err.message);

		logErrors('query', err, req, res);

		// log query asynchronously to ES
		es_client.index({
			index: 'search-logs-' + dateIsoString.substring(0, 7),
			type: 'doc',
			body: {
				timestamp: dateIsoString,
				querystring: text,
				tag: ['query', 'error'],
                type: 'query-error',
				collection: collections,
				succeeded: false,
				tenant_id: res.locals.user.tenant_id,
				request: {
					ip: res.locals.ip,
				}
			}
		}, function (error, response) {
			console.error(error);
		});
	});
});

// When a result is clicked this search endpoint is pinged with the result details (number of result, page number, url)
router.post('/suggest/:collections/:text', (req, res) => {
    // TODO parse click from the REST call

	let dateIsoString = new Date().toISOString();
	es_client.index({
		index: 'search-logs-' + dateIsoString.substring(0, 7),
		type: 'doc',
		body: {
			event_type: 'result-click',
			timestamp: dateIsoString,
			url: '', // TODO
            tenant_id: res.locals.user.tenant_id,
			request: {
				ip: res.locals.ip,
			}
		}
	}, function (error, response) {
		console.error(error);
	});

	res.send({success: 1})
});

function sortField(sort) {
	switch (sort) {
		case 'relevance':
			return '_score';
		case 'date':
			return 'topic_datetime';
		default:
			return '_score';
	}
}

export default router;
