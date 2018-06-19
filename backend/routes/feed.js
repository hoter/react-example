import {es_client} from "../server";
import bodyParser from "body-parser"
import express from 'express';
const router = express.Router();

// create application/json parser
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
//const urlencodedParser = bodyParser.urlencoded({ extended: false })

// https://www.google.com/support/enterprise/static/gsa/docs/admin/70/gsa_doc_set/feedsguide/feedsguide.html#1072960
// https://support.google.com/gsa/answer/6323481?hl=en

// POST /api/users gets JSON bodies
router.post('/', jsonParser, function (req, res) {
    if (!req.body) return res.sendStatus(400);

    // TODO verify schema?

    // TODO parse contents
    if (req.body.actions) {
        // TODO translate actions to bulk commands
        // splice them to optimal ES bulk size
        //req.body.actions.map()
    }
});

export default router;
