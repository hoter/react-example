import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({main: 'crawlers'});
});

router.get('/:crawler', (req, res) => {
    res.json({main: 'crawlers'});
});

router.put('/:crawler', (req, res) => {
    res.json({main: 'crawlers'});
});

router.delete('/:crawler', (req, res) => {
    res.json({main: 'crawlers'});
});


export default router;