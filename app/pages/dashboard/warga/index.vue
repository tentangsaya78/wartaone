<template>
  <div class="p-6">
    <h2 class="text-2xl">Selamat datang di dashboard RT</h2>
    <p>Sebuah wadah manegemen data warga dan administrasi RT</p>
  </div>
</template>

<script lang="ts" setup>
 definePageMeta({
   layout: 'warga',
 })
const { user, hasRole } = useAuth()
</script>

<style>

</style>