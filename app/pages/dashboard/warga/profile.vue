<template>
  <div>
     <span>{{ user }}</span>
     <img :src="user?.avatar?.url" alt="">
  </div>
</template>

<script lang="ts" setup>
  const { user, hasRole } = useAuth()
</script>

<style>

</style>