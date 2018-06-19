import express from 'express';
import {es_client, logErrors, CACHE} from "../server";
import _ from 'lodash';

const router = express.Router();

router.get('/', (req, res) => {
    function returnFilteredCollections(collections) {
        // TODO figure out user permissions and filter collections based on that
        _.keys(collections).forEach(function(element) {
            if (collections[element].enabled !== true) delete collections[element];
        });
        res.status(200).json(collections);
        res.end();
    }

    const documentKey = 'collections:' + res.locals.user.tenant_id;
    CACHE.get(documentKey, function( err, value ){
        if(!!err || value == undefined){
            // key was not found
            es_client.get({
                index: '.tenantId-config',
                type: 'doc',
                id: 'collections:' + res.locals.user.tenant_id,
            }, function (error, response) {
                // TODO validate tenant_id
                if (error) {
                    console.log(error);
                    logErrors('api', error, req, res);
                    res.json({});
                    return res.end();
                } else {
                    let collections = response._source.data;
                    CACHE.set(documentKey, collections);
                    returnFilteredCollections(collections);
                }
            });
        } else {
            // key was found
            returnFilteredCollections(value);
        }
    });
});

export default router;
