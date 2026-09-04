import { app } from './app';
import { config } from './ult/config';

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${config.port}`);
});
