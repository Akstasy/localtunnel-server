#!/usr/bin/env node -r esm

// import 'localenv';

import log from 'book';
import Debug from 'debug';
import config from './config';
import { PORT, DOMAIN, MAX_SOCKETS, HOST_ADDRESS, SSL } from './config/env';

import CreateServer from './server';

const debug = Debug('localtunnel');

const argv = {
      port: PORT,
  domain: DOMAIN,
  secure: SSL,
  address: HOST_ADDRESS,
  'max-sockets': MAX_SOCKETS,
}

const server = CreateServer({
    max_tcp_sockets: argv['max-sockets'],
    secure: argv.secure,
    domain: argv.domain,
});

server.listen(argv.port, argv.address, () => {
    debug('server listening on port: %d', server.address().port);
});

process.on('SIGINT', () => {
    process.exit();
});

process.on('SIGTERM', () => {
    process.exit();
});

process.on('uncaughtException', (err) => {
    log.error(err);
});

process.on('unhandledRejection', (reason, promise) => {
    log.error(reason);
});

// vim: ft=javascript

