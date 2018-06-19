import request from 'request';
import express from 'express';
import search from './search';
import suggest from './suggest';
import collections from './collections';
import feed from './feed';
import auth from './auth';
import admin from './admin/main';
import {es_hosts, es_client} from "../server";

const router = express.Router();

// TODO API Key validation middleware

router.use('/search/', search);
router.use('/suggest/', suggest);
router.use('/collections/', collections);
router.use('/feed/', feed);
router.use('/admin/', admin);
router.use('/auth/', auth);

router.get('/status', (req, res) => {
    es_client.ping({
        requestTimeout: 1000
    }, function (error) {
        if (error) {
            res.status(500).send({ ok: false });
        } else {
            res.status(200).send({ ok: true });
        }
    });
});

router.get('/quotas', (req, res) => {
    return res.json({
        documents: {
            used: 1000,
            quota: 1000000,
        },
        queries: {
            used: 105,
            quota: 1000000,
            period: 'month',
        },
        users: {
            used: 5,
            quota: 5,
        },
        account: {
            expires: '2019-01-01',
            next_billing: '2018-07-01',
        }
    });
});

router.use('/__es', function(req, res) {
    // Request method handling: exit if not GET
    if (!(req.method === 'GET')) {
        res.write(JSON.stringify({error: req.method + " request method is not supported. Use GET."}));
        res.end();
        return;
    }

    // pass the request to elasticsearch
    const url = es_hosts + req.url;
    console.log("Accessed Elasticsearch direct:" + url);
    req.pipe(request({
        uri: url,
        rejectUnauthorized: false,
    }, function (err, res, body) {
        // do nothing additional before returning the response
    })).pipe(res);
});

router.get('/stream/urls', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': contentDisposition('urls.json')
    });
    res.write('[\n');

    try {
        console.log('Starting streaming "urls"...');
        // first we do a search, and specify a scroll timeout
        es_client.search({
            index: 'tenantId*',
            scroll: '30s', // keep the search results "scrollable" for 30 seconds
            _source: ['title', 'author', 'url', 'topic_datetime'], // filter the source to only include the title field
            q: 'site:ynet.co.il'
        }, function getMoreUntilDone(error, response) {
            if (response.hits.hits) {
                // collect the title from each response
                response.hits.hits.forEach(function (hit) {
                    res.write(JSON.stringify({
                        url: hit._source.url,
                        title: hit._source.title,
                        author: hit._source.author,
                        topic_datetime: hit._source.topic_datetime
                    }) + ',\n');
                });

                // ask elasticsearch for the next set of hits from this search
                es_client.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                }, getMoreUntilDone);
            } else {
                res.write('{}]');
                console.log('Finished streaming "urls"');
                res.end();
            }
        });
    } catch (err) {
        console.error(err);
        res.end();
    }
});

// extracted from Express, used by `res.download()`
function contentDisposition(filename) {
    let ret = 'attachment';
    if (filename) {
        //filename = basename(filename);
        // if filename contains non-ascii characters, add a utf-8 version ala RFC 5987
        ret = /[^\040-\176]/.test(filename)
            ? 'attachment; filename="' + encodeURI(filename) + '"; filename*=UTF-8\'\'' + encodeURI(filename)
            : 'attachment; filename="' + filename + '"';
    }

    return ret;
}

export default router;
