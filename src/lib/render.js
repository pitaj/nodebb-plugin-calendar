import { promisify } from 'util';

const authentication = require.main.require('./src/routes/authentication');

const render = promisify((name, data, cb) => authentication.app.render(name, data, cb));

export default render;
