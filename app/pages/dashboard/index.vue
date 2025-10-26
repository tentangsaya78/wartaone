<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-4">Dashboard</h1>
    <p class="text-gray-600 mb-6">Selamat datang, {{ user?.name }}</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Menu untuk admin -->
      <NuxtLink 
        v-if="hasRole('administrator')" 
        to="/dashboard/admin"
        class="p-6 bg-blue-100 rounded-lg hover:bg-blue-200"
      >
        <h2 class="text-xl font-semibold">Admin Panel</h2>
        <p class="text-gray-600">Kelola sistem</p>
      </NuxtLink>

      <!-- Menu untuk admin & author -->
      <NuxtLink 
        to="/dashboard/warga"
        class="p-6 bg-green-100 rounded-lg hover:bg-green-200"
      >
        <h2 class="text-xl font-semibold">Dashboard Warga</h2>
        <p class="text-gray-600">Kelola data warga</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, hasRole } = useAuth()
</script>