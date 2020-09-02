import { promisify } from 'util';

const authentication = require.main?.require('./src/routes/authentication');

const render = promisify((
  name: string,
  data: unknown,
  cb: (err: Error | null, rendered: string) => void
) => authentication.app.render(name, data, cb));

export default render;
