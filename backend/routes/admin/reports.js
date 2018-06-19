import express from 'express';
import {es_client} from "../../server";

const router = express.Router();

router.get('/top-queries', (req, res) => {
    const top_searches = {};

    es_client.search({
        index: 'search-logs*',
        scroll: '30s', // keep the search top_searches "scrollable" for 30 seconds
        _source: ['timestamp','querystring'], // filter the source to only include the title field
        // TODO break down by collection?
        //q: 'collection:' + collection
    }, function getMoreUntilDone(error, response) {
        if (error) {
            console.error(error);
        } else if (response.hits.hits && response.hits.hits.length > 0) {
            // collect the title from each response
            response.hits.hits.forEach(function (hit) {
                // console.log(hit._source.timestamp + " - " + hit._source.querystring);
                let count = top_searches[hit._source.querystring];
                if (!count) count = 0;
                top_searches[hit._source.querystring] = count + 1;
            });

            // ask elasticsearch for the next set of hits from this search
            es_client.scroll({
                scrollId: response._scroll_id,
                scroll: '30s'
            }, getMoreUntilDone);
        } else {
            res.json(top_searches).end(); // TODO sort
        }
    });
});

router.get('/zero-results', (req, res) => {
    let filterQuery = [{ match_all: {} }];

    const dateFrom = req.query['from'] ? req.query['from'] : null; // TODO set sane defaults
    const dateTo = req.query['to'] ? req.query['to'] : null;
    if (dateFrom || dateTo) {
        filterQuery = [{
            range: {
                timestamp: {
                    gte: dateFrom,
                    lte: dateTo,
                }
            }
        }];
    }

    // TODO filter by collection
    // if (!!collection) {
    //     filterQuery.push({term:{collection:collection}});
    // }

    try {
        es_client.search({
            index: 'search-logs*',
            size: 50,
            body: {
                query: {
                    bool: {
                        filter: filterQuery,
                        must: [
                            {
                                term: {
                                    total_hits: 0
                                }
                            }
                        ]
                    }
                }
            }

        }, function (error, response) {
            if (error) {
                console.error(error);
            } else {
                let queries = response.hits.hits.map((x, index, arr) => {
                    return {
                        timestamp: x.timestamp,
                        querystring: x.querystring,
                        collection: x.collection,
                    }
                });
                res.json({queries});
                res.end();
            }
        });
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        res.end();
    }
});

router.get('/search-stats', (req, res) => {
    let filterQuery = [{ match_all: {} }];

    const dateFrom = req.query['from'] ? req.query['from'] : null; // TODO set sane defaults
    const dateTo = req.query['to'] ? req.query['to'] : null;
    if (dateFrom || dateTo) {
        filterQuery = [{
            range: {
                timestamp: {
                    gte: dateFrom,
                    lte: dateTo,
                }
            }
        }];
    }

    // TODO filter by collection
    // if (!!collection) {
    //     filterQuery.push({term:{collection:collection}});
    // }

    let interval = req.query['interval'] ? req.query['interval'] : "day";

    let queries_by_time, hits_percentiles, collections;
    try {
        es_client.search({
            index: 'search-logs*',
            size: 0,
            body: {
                query: {
                    bool: {
                        filter: filterQuery
                    }
                },
                aggs: {
                    collections: {
                        terms: {
                            field: 'site'
                        }
                    },
                    queries_by_time: {
                        date_histogram: {
                            field: 'timestamp',
                            interval : interval
                        }
                    },
                    hits_percentiles : {
                        percentiles : {
                            field : "total_hits"
                        }
                    },
                    latency_percentiles : {
                        percentiles : {
                            field : "took",
                            percents : [50, 75, 95, 99, 99.9]
                        }
                    }
                }
            }

        }, function (error, response) {
            if (error) {
                console.error(error);
            } else {
                let aggs = response.aggs || response.aggregations;
                queries_by_time = aggs.queries_by_time.buckets;
                collections = aggs.collections.buckets;
                hits_percentiles = aggs.hits_percentiles.values;
                res.json({queries_by_time, collections, hits_percentiles});
                res.end();
            }
        });
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        res.end();
    }
});

export default router;
