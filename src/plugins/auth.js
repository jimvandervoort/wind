export default function makeAuthPlugin(auth) {
  return {
    install: (app) => {
      app.provide('auth', auth);
      console.log('auth', auth);
    }
  }
}
