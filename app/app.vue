<template>
  <div>
    <!-- Loading screen saat cek auth -->
    <div v-if="isCheckingAuth" class="fixed inset-0 flex items-center justify-center bg-primary-500">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
        <p class="mt-4 text-white">Memuat...</p>
      </div>
    </div>
      <!-- Konten utama -->
    <div v-else>
    <nuxt-layout >
    <NuxtPage  />
    </nuxt-layout>
    </div>

 
  </div>
</template>

<script setup lang="ts">
const { isAuthChecked } = useAuth()

// Anggap sedang checking sampai middleware selesai
const isCheckingAuth = computed(() => {
  // Jika di halaman publik, tidak perlu loading
  const publicPages = ['/', '/login', '/register', '/unauthorized']
  const currentPath = useRoute().path
  
  if (publicPages.includes(currentPath)) return false
  
  // Di halaman protected, tampilkan loading sampai auth selesai dicek
  return !isAuthChecked.value
})
</script>