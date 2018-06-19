import express from 'express';
import {es_client, logErrors} from "../server";

const router = express.Router();

router.get('/:text', (req, res) => {
    const { text } = req.params;
    const { collections } = req.query;
    const collectionsArr = (collections || 'wikipedia,ynet').split(',').map(x => x + '.co.il');

    // TODO make sure user has permissions to view / query those collections

    es_client.search({
            index: 'suggest',
            size: 0,
            body: {
                "_source": false,
                suggest: {
                    autocomplete: {
                        prefix: text,
                        completion: {
                            field: "suggest",
                            size: 5,
                            contexts: {
                                collection: ["all"], // TODO
                                //tenant_id: res.locals.user.tenant_id, // TODO get tenant ID from logged in user
                            }
                        }
                    }
                }
            },
        }
    ).then(function (resp) {
        const {took, suggest} = resp;
        if (suggest.autocomplete && suggest.autocomplete[0].options) {
            let suggestions = suggest.autocomplete[0].options.map((x, index, arr) => {
                return {
                    text: x.text,
                    score: x._score,
                    // TODO ? source: x._source
                }
            });
            res.json({took, suggestions});
        } else {
            res.json({took, suggestions: []});
        }
        res.end();

        // TODO log?

    }, function (err) {
        console.error(err.message);
        logErrors('query', err, req, res);
    });
});

export default router;