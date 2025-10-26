<template>
  <div class="p-4">
    <u-form @submit.prevent="handleUpdate" class="space-y-4 max-w-md">
      <u-form-field label="Judul">
        <u-input v-model="formDokumen.title" class="w-full" required
          placeholder="Contoh: Dokumen Kebersihan Januari 2025" />
      </u-form-field>

      <!-- Preview gambar yang sudah ada -->
      <div v-if="currentImageUrl && !imageRemoved" class="relative">

        <div class="relative block p-2">
            <UButton type="button" icon="i-heroicons-x-mark" color="error" size="sm"
              class="absolute top-2  right-2  rounded-full shadow-lg  flex" @click="removeCurrentImage" />
          <img :src="currentImageUrl" class=" w-full max-h-64 object-contain border border-gray-300 rounded-lg"
            alt="dokumen" />
        </div>

      </div>

      <!-- Upload file baru -->
      <div v-if="!currentImageUrl || imageRemoved">
        <UFileUpload v-model="selectedFile" label="Masukkan Dokumen Baru"
          class="w-full min-h-48 border-gray-300 border-dashed" accept="image/*" />

      </div>

      <!-- Progress upload -->
      <div v-if="uploadProgress" class="text-primary text-sm p-3 bg-blue-50 rounded flex items-center gap-2">
        <span class="animate-spin">
          <Icon name="bi-arrow-clockwise" class="w-4 h-4" />
        </span> {{ uploadProgress }}
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="text-red-500 text-sm p-3 bg-red-50 rounded">
        ❌ {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="text-green-500 text-sm p-3 bg-green-50 rounded">
        ✅ {{ successMessage }}
      </div>

      <u-button type="submit"  trailing-icon="bi-send" :loading="isSubmitting"
        :disabled="isSubmitting || !formDokumen.title" class="max-w-max">
        {{ isSubmitting ? 'Memperbarui...' : 'Update Dokumen' }}
      </u-button>
    </u-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'

definePageMeta({
  layout: 'warga',
  title: 'Update Dokumen',
  description: 'Perbarui data Dokumen yang sudah ada'
})

const { user, token } = useAuth()
const wpUrl = useRuntimeConfig().public.wpUrl
const route = useRoute()
const { request } = useWpApi()

// Ambil data Dokumen dari API
const { data: dok, pending, refresh } = await request(`api/v1/content/id/${route.params.id}`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token.value}`,
  },
})

// State untuk form
const formDokumen = reactive({
  title: '',
  content: '',
  status: 'publish',
  author: user.value?.id || null,
})

const isSubmitting = ref(false)
const uploadProgress = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const currentImageUrl = ref('')
const imageRemoved = ref(false)
const uploadedMediaId = ref<number | null>(null)
const errorMessage = ref('')
const successMessage = ref('')

// Fungsi untuk menghapus gambar saat ini
const removeCurrentImage = () => {
  imageRemoved.value = true
  currentImageUrl.value = ''
  uploadedMediaId.value = null
}

// Watch perubahan selectedFile untuk membuat preview
watch(selectedFile, (newFile) => {
  if (newFile) {
    // Validasi file
    if (!newFile.type.startsWith('image/')) {
      errorMessage.value = 'File harus berupa gambar'
      selectedFile.value = null
      return
    }
    if (newFile.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file maksimal 5MB'
      selectedFile.value = null
      return
    }

    errorMessage.value = ''

    // Buat preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(newFile)
  } else {
    previewUrl.value = ''
  }
})

// Sinkronisasi data dari API ke form
watch(
  dok,
  (val) => {
    if (val) {
      formDokumen.title = val.title || ''
      formDokumen.content = val.content || ''
      currentImageUrl.value = val.featured_image || ''

      // Simpan ID media jika ada
      if (val.featured_media) {
        uploadedMediaId.value = val.featured_media
      }
    }
  },
  { immediate: true }
)

// Upload media baru ke WordPress
const uploadMedia = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', formDokumen.title)
  formData.append('alt_text', `Bukti pembayaran - ${formDokumen.title}`)

  uploadProgress.value = 'Mengupload gambar baru...'

  try {
    const res = await $fetch(`${wpUrl}/wp/v2/media`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })
    uploadProgress.value = 'Gambar berhasil diupload'
    return res
  } catch (err: any) {
    console.error('Upload media error:', err)
    throw new Error(err?.data?.message || err?.message || 'Gagal upload media')
  }
}

// Handle form update
const handleUpdate = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!formDokumen.title.trim()) {
    errorMessage.value = 'Judul harus diisi'
    return
  }

  isSubmitting.value = true
  uploadProgress.value = ''

  try {
    let featuredMediaId = uploadedMediaId.value

    // Upload media baru jika ada file yang dipilih
    if (selectedFile.value) {
      uploadProgress.value = 'Mengupload Dokumen baru...'
      const media = await uploadMedia(selectedFile.value)

      if (!media?.id) {
        throw new Error('Gagal mendapatkan ID media')
      }

      featuredMediaId = media.id
    }

    // Jika gambar dihapus tapi tidak ada file baru
    if (imageRemoved.value && !selectedFile.value) {
      featuredMediaId = null
    }

    // Update dokumen
    uploadProgress.value = 'Menyimpan perubahan...'

    const postData: any = {
      title: formDokumen.title,
      content: formDokumen.content || '',
      status: formDokumen.status,
    }

    if (formDokumen.author) {
      postData.author = formDokumen.author
    }

    // Set featured_media, termasuk null jika dihapus
    if (featuredMediaId !== undefined) {
      postData.featured_media = featuredMediaId
    }

    await $fetch(`${wpUrl}/wp/v2/dokumen/${route.params.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: postData,
    })

    successMessage.value = 'Data Dokumen berhasil diperbarui!'
    uploadProgress.value = ''

    // Refresh data dari server
    await refresh()

    // Reset state
    imageRemoved.value = false
    selectedFile.value = null
    previewUrl.value = ''

  } catch (err: any) {
    console.error('Error submit:', err)
    errorMessage.value = err?.message || 'Terjadi kesalahan saat memperbarui data'
    uploadProgress.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>