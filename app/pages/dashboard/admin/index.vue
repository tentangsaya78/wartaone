<template>
  <div class="flex flex-col gap-6">
     <div>
        <h2 class="text-2xl">Selamat datang di dashboard warga</h2>
    <p>Sebuah wadah manegemen data warga dan administrasi RT</p>
     </div>
     <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
      <div class="p-4 rounded-xl border border-gray-300 border-dashed bg-white">
        <h1 class="text-4xl mb-3">{{ dokumen?.data?.length }}</h1>
        <p>Jumlah Dokumen Warga</p>
      </div>

      <div class="p-4 rounded-xl border border-gray-300 border-dashed bg-white">
        <h1 class="text-4xl mb-3">{{ users?.authors?.length }}</h1>
        <p>Jumlah KK / Warga </p>
      </div>
     </div>
  </div>
</template>

<script lang="ts" setup>
 definePageMeta({
   layout: 'admin',
 })

const { user, hasRole, token } = useAuth()
const { request } = useWpApi()


// Ambil data dari API custom
const { data: dokumen, pending, refresh } = await request('api/v1/posts/dokumen', {
  headers: {
    Authorization: `Bearer ${token.value}`,
  },
})

const { data: users, pending:pendingUsers , refresh: refreshUsers } = await request('api/v1/users', {
  headers: {
    Authorization: `Bearer ${token.value}`,
  },
})

</script>

<style>

</style>