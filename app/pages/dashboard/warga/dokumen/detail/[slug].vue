<template>
  <div class="p-6 flex flex-col gap-4 max-w-xl w-full relative">
    <button class="absolute top-4 right-4 cursor-pointer" @click="router.back()">
      <icon name="bi-x-lg"></icon>
    </button>
    <h2 class="text-xl font-medium">{{ dokumen?.title }}</h2>
    <img :src="dokumen?.featured_image" alt="" class="max-w-80 w-full rounded-xl">

  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'warga',
  title: ' Dokumen',
})
 const { user, hasRole, token } = useAuth()
 const router = useRouter()
 const { request } = useWpApi()


 // Ambil data dari API custom
const { data: dokumen, pending, refresh } = await request(`api/v1/content/${router.currentRoute.value.params.slug}`, {
  headers: {
    Authorization: `Bearer ${token.value}`,
  },
})
</script>

<style>

</style>