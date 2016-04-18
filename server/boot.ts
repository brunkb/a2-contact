import * as connectLivereload from 'connect-livereload';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {resolve} from 'path';

import {LIVE_RELOAD_PORT, PATHS, PORT, APP_ROOT} from '../tools/config';
import * as contactRouter from './contact/router';
import * as kenpoRouter from './router';

const INDEX_DEST_PATH = resolve(PATHS.cwd, PATHS.dest.dist.base, 'index.html');

const server = express();

server.use(APP_ROOT, <any> connectLivereload({ port: LIVE_RELOAD_PORT }));
server.use(express.static(PATHS.dest.dist.base));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.get('/api/**', (req, res, next) => {
  // TODO: remove this. It just mimics a delay in the backend.
  const delay = Math.floor((Math.random() * 300) + 1);
  setTimeout(() => next(), delay);
});

server.use('/api/contact', contactRouter);

server.use('/api/kenpo', kenpoRouter);

server.get(`${APP_ROOT}*`, (req, res) => {
  res.sendFile(INDEX_DEST_PATH);
});

server.listen(PORT);


