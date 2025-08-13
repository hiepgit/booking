import { createServer } from './app.js';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = createServer();

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});
