<script setup>
import { inject, ref } from 'vue'

const auth = inject('auth');
const api = inject('api');
const apiResponse = ref(null);

const login = () => {
  auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:5173',
    }
  });
}

const logout = () => {
  auth.signOut()
}

const getSession = async () => {
  const { data, error } = await auth.getSession()
  console.log(data, error)
}

const whoami = async () => {
  try {
    const response = (await api.get('/whoami')).json()
    apiResponse.value = response
  } catch (error) {
    apiResponse.value = error
  }
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl mb-4">Login</h1>
    <div class="space-x-4">
      <button class="hover:underline" @click="login()">Login with Google</button>
      <button class="hover:underline" @click="logout()">Logout</button>
      <button class="hover:underline" @click="getSession()">Get Session</button>
      <button class="hover:underline" @click="whoami()">Who am I?</button>
      <pre class="mt-4">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
  </div>
</template>
