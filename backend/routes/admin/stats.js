import express from 'express';
import {es_client} from "../../server";

const router = express.Router();

router.get('/events', (req, res) => {
    const interval = req.params.interval || 'day'; // TODO
    es_client.search({
        index: 'system-logs-*',
        size: 0,
        body: {
            // query: {
            //     bool: {
            //         filter: {
            //             terms: {
            //                 field: "collection",
            //             }
            //         }
            //     }
            // },
            aggs: {
                histogram: {
                    date_histogram: {
                        field: 'timestamp',
                        interval : interval
                    },
                    aggs: {
                        types: {
                            terms: {
                                field: 'tags'
                            }
                        }
                    }
                },
            }
        }

    }, function (error, response) {
        if (error) {
            console.error(error);
        } else {
            let aggs = response.aggs || response.aggregations;
            res.json({histogram: aggs.histogram});
        }
    });
});

router.get('/collections', (req, res) => {
        let searchQuery = {
            index: 'tenantId*',
            body: {
                size: 0,
                aggs: {collections:{terms: {field: "collection"}}}
            }
        };

        es_client.search(searchQuery).then(function (resp) {
            const {timed_out, hits: {total}} = resp;
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

            res.json({collections: aggs.collections.buckets, total_docs: total});
            res.end();
        });
    });


router.get('/elasticsearch/nodes', (req, res) => {
    es_client.cat.nodes({format: 'json', h:'ip,version,disk.avail,disk.used_percent,heap.percent,ram.percent,' +
        'file_desc.percent,load_1m,load_5m,load_15m,uptime,node.role,name,' +
        'query_cache.memory_size,query_cache.evictions,request_cache.memory_size,request_cache.evictions'},
        function (err, data) {
            if (err) {
                // TODO
            }
            res.send({nodes: data});
        });
});

export default router;
