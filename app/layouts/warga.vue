<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-56'
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-300">
        <h1
          v-if="!collapsed"
          class="text-lg font-semibold text-gray-800"
        >
          Dashboard
        </h1>
        <button
          class="p-2 rounded hover:bg-gray-100"
          @click="collapsed = !collapsed"
        >
          <UIcon
            :name="collapsed ? 'i-heroicons-bars-3' : 'i-heroicons-x-mark'"
            class="w-5 h-5 text-gray-600"
          />
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 py-4">
        <ul>
          <li v-for="item in menu" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              active-class="bg-primary-50 text-primary-600 font-medium"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- User Info (Optional) -->

       <UPopover>
    <div class="p-4 border-t border-gray-200 w-full">
        <div v-if="!collapsed" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
            {{ user.name[0] }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-700 truncate">{{ user.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
          </div>
        </div>
        <div v-else class="flex justify-center">
          <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
            {{ user.name[0] }}
          </div>
        </div>
      </div>

    <template #content>
      <div class="p-1 w-full pb-10">
        <u-button color="neutral" variant="link" trailing-icon="bi-box-arrow-right" class="w-full text-left" @click="logout"> Logout</u-button>
      </div>
    </template>
  </UPopover>

      
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Page Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="mb-2">
          <UBreadcrumb :links="breadcrumbLinks" />
        </div>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h2>
            <p v-if="pageDescription" class="text-sm text-gray-600 mt-1">
              {{ pageDescription }}
            </p>
          </div>
          <div v-if="pageActions">
            <slot name="actions" />
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
const { user, logout } = useAuth()
const route = useRoute()
const collapsed = ref(false)

const menu = [
  { label: 'Home', icon: 'i-heroicons-home', to: '/dashboard/warga' },
  { label: 'Dokumen', icon: 'i-heroicons-document-text', to: '/dashboard/warga/dokumen' },
  { label: 'Iuran', icon: 'i-heroicons-banknotes', to: '/dashboard/warga/iuran' }
]

// Get page metadata
const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard'
})

const pageDescription = computed(() => {
  return route.meta.description || ''
})

const pageActions = computed(() => {
  return route.meta.showActions || false
})

// Generate breadcrumb from route
const breadcrumbLinks = computed(() => {
  // Breadcrumb manual dari meta
  if (route.meta.breadcrumb && Array.isArray(route.meta.breadcrumb)) {
    return route.meta.breadcrumb
  }

  // Auto-generate dari path
  const paths = route.path.split('/').filter(Boolean)
  const links = []

  // Home/Dashboard
  links.push({
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/dashboard'
  })

  // Build breadcrumb dari path
  let currentPath = ''
  for (let i = 0; i < paths.length; i++) {
    const segment = paths[i]
    
    // Skip 'dashboard' karena sudah jadi home
    if (segment === 'dashboard') continue

    currentPath += '/' + segment

    // Capitalize dan replace dash/underscore
    const label = segment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    links.push({
      label: label,
      to: currentPath
    })
  }

  return links
})
</script>