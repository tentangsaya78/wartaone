<template>
  <div class="p-4">
    <u-form @submit.prevent="handleIuran" class="space-y-4 max-w-md">
      <u-form-field label="Judul">
        <u-input v-model="formIuran.title" class="w-full" required/>
      </u-form-field>

      <u-form-field label="Deskripsi">
        <u-textarea v-model="formIuran.content" class="w-full" rows="4"/>
      </u-form-field>

      <UFileUpload v-model="selectedFile" label="Masukan Bukti transaksi" class="w-full min-h-48 border-gray-300 border-dashed" />
      <div v-if="errorMessage" class="text-red-500 text-sm p-3 bg-red-50 rounded">
        ❌ {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="text-green-500 text-sm p-3 bg-green-50 rounded">
        ✅ {{ successMessage }}
      </div>

      <u-button type="submit" trailing-icon="bi-send" :loading="isSubmitting" :disabled="isSubmitting || !formIuran.title">
        {{ isSubmitting ? 'Mengirim...' : 'Submit' }}
      </u-button>
    </u-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'warga',
  title : 'Konformasi Iuran',
  description : 'sebagai catatan warga bahwa iuran telah dibayarkan '
})

const { user, token } = useAuth()
const wpUrl = useRuntimeConfig().public.wpUrl
const formIuran = reactive({
  title: '',  
  content: '',
  status: 'publish',
  author: null, // optional
})  

const isSubmitting = ref(false)
const uploadProgress = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const uploadedMediaId = ref<number | null>(null)
const errorMessage = ref('')
const successMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// ===== Handle file selection =====
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'File harus berupa gambar'
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file maksimal 5MB'
      return
    }

    selectedFile.value = file
    errorMessage.value = ''

    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// ===== Upload media langsung di sini =====
const uploadMedia = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', formIuran.title)
  formData.append('alt_text', formIuran.title)

  uploadProgress.value = 'Mengupload gambar...'

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

// ===== Handle form submit =====
const handleIuran = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!formIuran.title.trim()) {
    errorMessage.value = 'Judul harus diisi'
    return
  }

  isSubmitting.value = true
  uploadProgress.value = ''

  try {
    let featuredMediaId = uploadedMediaId.value

    if (selectedFile.value && !featuredMediaId) {
      const media = await uploadMedia(selectedFile.value)
      if (media?.id) {
        featuredMediaId = media.id
        uploadedMediaId.value = featuredMediaId
      } else {
        throw new Error('Gagal mendapatkan ID media')
      }
    }

    uploadProgress.value = 'Membuat post...'

    const postData: any = {
      title: formIuran.title,
      content: formIuran.content || '',
      status: formIuran.status,
    }
    if (formIuran.author) postData.author = formIuran.author
    if (featuredMediaId) postData.featured_media = featuredMediaId

    const postResult = await $fetch(`${wpUrl}/wp/v2/iuran`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: postData,
    })

    successMessage.value = 'Iuran berhasil dibuat!'
    uploadProgress.value = ''

    // reset form
    formIuran.title = ''
    formIuran.content = ''
    selectedFile.value = null
    previewUrl.value = ''
    uploadedMediaId.value = null
    if (fileInput.value) fileInput.value.value = ''

  } catch (err: any) {
    console.error('Error submit:', err)
    errorMessage.value = err?.message || 'Terjadi kesalahan'
    uploadProgress.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>
