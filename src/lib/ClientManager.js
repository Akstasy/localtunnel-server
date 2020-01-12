import { hri } from 'human-readable-ids';
import Debug from 'debug';
import { range, map, pullAll } from 'lodash';

import Client from './Client';
import TunnelAgent from './TunnelAgent';


const getPortRange = (rangeStr) => {
    if (!rangeStr) return;
    const ports = rangeStr.split('-').map(nb => Number.parseInt(nb, 10));
    const range = { min: ports[0], max: ports[1] };
    return range;
}
const portRange = getPortRange(process.env.PORT_RANGE);

// Manage sets of clients
//
// A client is a "user session" established to service a remote localtunnel client
class ClientManager {
    constructor(opt) {
        this.opt = opt || {};

        // id -> client instance
        this.clients = new Map();

        // statistics
        this.stats = {
            tunnels: 0
        };

        this.debug = Debug('lt:ClientManager');

        // This is totally wrong :facepalm: this needs to be per-client...
        this.graceTimeout = null;
    }

    getPort() {
	if (!portRange) return;
	const { min, max } = portRange;
	const clientPorts = map(this.clients, 'port');
	const ports = range(min, max + 1);
	const availablePorts = pullAll(ports, clientPorts);
	this.debug('available ports: %s', availablePorts);
	return availablePorts[0];
    }


    // create a new tunnel with `id`
    // if the id is already used, a random id is assigned
    // if the tunnel could not be created, throws an error
    async newClient(id) {
        const clients = this.clients;
        const stats = this.stats;

        // can't ask for id already is use
        if (clients[id]) {
            id = hri.random();
        }

        const maxSockets = this.opt.max_tcp_sockets;
        const agent = new TunnelAgent({
            clientId: id,
            maxSockets: 10,
	    port: this.getPort(),
        });

        const client = new Client({
            id,
            agent,
        });


        // add to clients map immediately
        // avoiding races with other clients requesting same id
        clients[id] = client;

        client.once('close', () => {
            this.removeClient(id);
        });

        // try/catch used here to remove client id
        try {
            const info = await agent.listen();
            ++stats.tunnels;
            return {
                id: id,
                port: info.port,
                max_conn_count: maxSockets,
            };
        }
        catch (err) {
            this.removeClient(id);
            // rethrow error for upstream to handle
            throw err;
        }
    }

    removeClient(id) {
        this.debug('removing client: %s', id);
        const client = this.clients[id];
        if (!client) {
            return;
        }
        --this.stats.tunnels;
        delete this.clients[id];
        client.close();
    }

    hasClient(id) {
        return !!this.clients[id];
    }

    getClient(id) {
        return this.clients[id];
    }
}

export default ClientManager;
