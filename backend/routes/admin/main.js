import express from 'express';

import collections from './collections';
import crawlers from './crawlers';
import reports from './reports';
import stats from './stats';

const router = express.Router();


router.use('/collections/', collections);
router.use('/crawlers/', crawlers);
router.use('/stats/', stats);

// import pinned from './pinned';
// router.use('/pinned/', pinned);

router.use('/reports/', reports);

export default router;