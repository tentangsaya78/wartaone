<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
      <h2 class="text-3xl font-bold text-center">Login</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Username</label>
          <input 
            v-model="username" 
            type="text" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <u-button 
          type="submit" 
          :disabled="loading"
          size="xl"
          class="w-full py-2"
        >
          {{ loading ? 'Memproses...' : 'Login' }}
        </u-button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
const { login, loading, error, redirectToDashboard } = useAuth()

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await login(username.value, password.value)
  
  if (success) {
    // Redirect ke dashboard sesuai role
    redirectToDashboard()
  }
}
</script>