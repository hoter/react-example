import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({});
});

// TODO snag style from https://developer.sketchapp.com/reference/api/


// TODO Swagger integration for API documentation
// https://blog.cloudboost.io/adding-swagger-to-existing-node-js-project-92a6624b855b
// https://www.npmjs.com/package/swagger-node-express

export default router;
