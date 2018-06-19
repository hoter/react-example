import express from 'express';
import { es_client, logErrors } from '../../server';
import _ from 'lodash';

const router = express.Router();

router.get('/', (req, res) => {
	es_client.get(
		{
			index: '.tenantId-config',
			type: 'doc',
			id: 'collections:tenantId',
		},
		function (error, response) {
			if (error) {
				console.log(error);
				logErrors('api', error, req, res);
				res.status(500).json({});
				res.end();
			} else {
				// TODO figure out user permissions and filter collections based on that
				let collections = response._source.data;
				_.keys(response._source.data).forEach(function (element) {
					if (collections[element].enabled !== true) delete collections[element];
				});
				res.status(200).json(collections);
			}
		}
	);
});

// Collections CRUD
router.get('/:collection', (req, res) => {
	res.json({ ok: 1 });
});
router.post('/:collection', (req, res) => {
	res.json({ ok: 1 });
});
router.put('/:collection', (req, res) => {
	res.json({ ok: 1 });
});
router.delete('/:collection', (req, res) => {
	res.json({ ok: 1 });
});

// Metadata fields Read and Update
router.get('/:collection/metadata', (req, res) => {
	res.json({ ok: 1 });
});
router.put('/:collection/metadata', (req, res) => {
	res.json({ ok: 1 });
});

export default router;
