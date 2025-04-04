import { makeApp } from './app';

const app = makeApp();

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
