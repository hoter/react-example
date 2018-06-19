import express from 'express';
import elasticsearch from 'elasticsearch';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import api from './routes/api';
import NodeCache from 'node-cache';

import { SESSION_SECRET } from './serverConfig';

const app = express();
const port = process.env.PORT || 9001;

const env = app.get('env');
console.log(env);

export const es_hosts = process.env.ELASTICSEARCH_HOSTS || 'http://localhost:9200/';
console.log('Elasticsearch hosts is set to ' + es_hosts);

export const CACHE = new NodeCache({ stdTTL: 60 });

export const es_client = new elasticsearch.Client({
	host: es_hosts,
	log: 'warning',
});
es_client.ping(
	{
		requestTimeout: 1000,
	},
	function (error) {
		if (error) {
			console.error('elasticsearch cluster is down!');
		}
	}
);

export function logErrors (errorScope, err, req, res) {
	const dateIsoString = new Date().toISOString();
	es_client.index(
		{
			index: 'system-logs-' + dateIsoString.substring(0, 7),
			type: 'doc',
			body: {
				timestamp: dateIsoString,
				error: err.message,
				tag: [ errorScope, 'error' ],
				type: 'error',
				request: {
					ip: res.locals.ip,
				},
			},
		},
		function (error, response) {
			console.error(error);
		}
	);
}

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://localhost:9000');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
	next();
});

if (env === 'production') {
	console.log('Run production code');

	app.use(express.static('build', { index: false }));
	app.get('/', function (req, res) {
		res.sendFile(path.join(__dirname + '/../build/index.html'));
	});
}

app.use(session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
	res.locals.user = {
		tenantId: req.isAuthenticated() ? req.user.tenantId : 'tenantId'
	};
	next();
});

app.use('/api/', api);

app.listen(port, () => console.log(`Listening on port ${port}`));
