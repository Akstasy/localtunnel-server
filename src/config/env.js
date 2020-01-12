export const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4444;
export const DOMAIN = process.env.DOMAIN;
export const SSL = process.env.SSL === "true" ? true : false;
export const MAX_SOCKETS = process.env.MAX_SOCKETS ? Number.parseInt(process.env.MAX_SOCKETS, 10) : 10;
export const HOST_ADDRESS = process.env.HOST_ADDRESS || '0.0.0.0';
