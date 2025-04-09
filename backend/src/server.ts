import { makeApp } from './app';
import { Db } from './db';

const db = new Db();
const app = makeApp(db);

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
