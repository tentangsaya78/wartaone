<template>
  <div>
    <nav class="py-2 border-b border-gray-300 bg-white ">
      <div class="container">
        <div class="flex justify-between items-center">
          <nuxt-link to="/" class="text-2xl font-bold text-primary ">WartaOne</nuxt-link>
          <ul class="flex items-center gap-4">
           <li v-for="menu in menus">
            <u-link :to="menu.link" class="hover:underline" active-class="font-bold">{{ menu.label }}</u-link>
           </li>
          </ul>
          <div class="flex items-center gap-2">
            <span v-if="hasRole('administrator')" class="text-green-500 font-bold">Admin</span>
            
            <span v-if="user">{{ user?.name }}</span>
            <u-button v-if="user" icon="bi:box-arrow-right" @click="logout">Logout</u-button>
            <u-button v-else icon="bi-box-arrow-in-right" to="/login">Login</u-button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
const { user, hasRole, logout } = useAuth()

const menus = [
  {
    label: 'Home',
    link: '/'
  },
  {
    label: 'About',
    link: '/about'
  },
  {
    label: 'Contact',
    link: '/contact'
  }
]
</script>

<style></style>