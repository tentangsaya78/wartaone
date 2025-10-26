<template>
  <div class="p-4 space-y-4">
    <!-- create button -->
    <div>
     <UButton to="/dashboard/warga/iuran/create" color="primary" class="mb-4" trailing-icon="i-heroicons-plus">
        Konfirmasi
      </UButton>
    </div>

    <!-- 🔍 Filter -->
    <div class="flex items-center gap-4">
      <UInput
        v-model="searchTitle"
        placeholder="Cari berdasarkan judul..."
        class="flex-1"
        icon="i-heroicons-magnifying-glass"
      />
      <UInput
        v-model="searchDate"
        type="date"
        placeholder="Filter tanggal"
        class="w-64"
        icon="i-heroicons-calendar"
      />
      <UButton
        v-if="searchTitle || searchDate"
        color="gray"
        variant="soft"
        icon="i-heroicons-x-mark"
        @click="clearFilters"
      >
        Reset
      </UButton>
    </div>

    <!-- Info & Items per page -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Menampilkan {{ startItem }} - {{ endItem }} dari {{ filteredData.length }} data
      </div>
      
    
    </div>

    <!-- 📋 Table -->
    <div v-if="paginatedData.length > 0" class="rounded-lg overflow-hidden shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gambar
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Judul
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, index) in paginatedData" :key="row.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ startItem + index }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <img
                v-if="row.featured_image"
                :src="row.featured_image"
                class="w-10 h-10 object-cover rounded-full shadow-sm"
                alt="featured"
                @error="handleImageError"
              />
              <div v-else class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-gray-400 text-xs">No img</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ row.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ row.dateFormatted }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <UButton
                  :to="`/dashboard/warga/iuran/${row.slug}`"
                  color="primary"
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-eye"
                  label="Lihat"
                />

                
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

   <!-- Pagination -->
      <UPagination v-if="iuran?.pagination?.total > itemsPerPage" v-model:page="currentPage" :items-per-page="itemsPerPage" :total="totalItems" />

    <!-- Empty State -->
    <div v-if="filteredData.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p class="text-gray-500 text-sm">Tidak ada data</p>
      <UButton
        v-if="searchTitle || searchDate"
        color="primary"
        variant="soft"
        class="mt-4"
        @click="clearFilters"
      >
        Reset Filter
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500 mx-auto" />
      <p class="text-gray-500 text-sm mt-2">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-12">
      <div class="text-red-400 mb-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 mx-auto" />
      </div>
      <p class="text-red-600 text-sm">{{ error }}</p>
      <UButton
        color="primary"
        variant="soft"
        class="mt-4"
        @click="refreshData"
      >
        Coba Lagi
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { page } from '#build/ui'


definePageMeta({
  layout: 'warga',
  title: 'Data Iuran',
  description: 'Kelola dan lihat data iuran bulanan warga',
})

const { token } = useAuth()
const { request } = useWpApi()

// Filter state
const searchTitle = ref('')
const searchDate = ref('')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)



// Ambil data dari API custom
const { data: iuran, pending, refresh } = await request('api/v1/posts/iuran', {
  headers: {
    Authorization: `Bearer ${token.value}`,
  },
})

// Helper function untuk format tanggal
const parseDate = (dateString: string) => {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

const formatDateToInput = (dateString: string) => {
  const date = parseDate(dateString)
  if (!date) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

const formatDateDisplay = (dateString: string) => {
  const date = parseDate(dateString)
  if (!date) return dateString
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Data table
const dataUtable = computed(() => {
  if (!iuran.value?.data) return []
  
  const list = Array.isArray(iuran.value.data) ? iuran.value.data : []
  
  return list.map((item: any) => ({
    id: item.id,
    slug: item.slug || '',
    title: item.title || 'Tanpa judul',
    date: item.date || '-',
    dateFormatted: formatDateDisplay(item.date || '-'),
    dateInput: formatDateToInput(item.date || ''),
    featured_image: item.featured_image || null,
  }))
})




// Clear filters
const clearFilters = () => {
  searchTitle.value = ''
  searchDate.value = ''
  currentPage.value = 1
}

// Filter logic
const filteredData = computed(() => {
  let filtered = [...dataUtable.value]
  
  // Filter by title
  if (searchTitle.value.trim()) {
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(searchTitle.value.toLowerCase())
    )
  }
  
  // Filter by date
  if (searchDate.value) {
    filtered = filtered.filter((item) => item.dateInput === searchDate.value)
  }
  
  return filtered
})

// Pagination calculations
 const totalPages = computed(() => iuran?.value?.pagination?.total_pages)
 const totalItems = computed(() => iuran?.value?.pagination?.total)

const startItem = computed(() => {
  if (filteredData.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return end > filteredData.value.length ? filteredData.value.length : end
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

// Reset ke page 1 kalau filter atau items per page berubah
watch([searchTitle, searchDate, itemsPerPage], () => {
  currentPage.value = 1
})

// Handle image error
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/64?text=No+Image'
}


// Refresh data function
const refreshData = () => {
  refresh()
}

// Debug
watch([currentPage, itemsPerPage], ([page, perPage]) => {
  console.log('📄 Pagination:', { page, perPage, total: filteredData.value.length })
})
</script>