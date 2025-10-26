<template>
  <div>
    <h1>Update Profile</h1>
    <form @submit.prevent="handleProfile">
      <input type="text" v-model="formProfile.name" placeholder="Nama">
      <input type="text" v-model="formProfile.email" placeholder="Email">
      <input type="text" v-model="formProfile.hp" placeholder="No HP">
      <input type="text" v-model="formProfile.noRumah" placeholder="No Rumah">
      <button type="submit">Update</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const { user, token } = useAuth()
const { request } = useWpApi()

// reactive data, ambil dari user yang sudah login
const formProfile = reactive({
  name: user.value?.name || '',
  email: user.value?.email || '',
  hp: user.value?.acf?.no_hp || '',
  noRumah: user.value?.acf?.no_rumah || '',
})

// fungsi update profil
const handleProfile = async () => {
  try {
    const data = {
      name: formProfile.name,
      email: formProfile.email,
      // field WordPress standar
      acf: {
        no_hp: formProfile.hp,
        no_rumah: formProfile.noRumah
      }
    }

    const res = await request(`wp/v2/users/${user.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        name: formProfile.name,
        meta: { no_hp: formProfile.hp, no_rumah: formProfile.noRumah },
      },
    })


    console.log('✅ Profil berhasil diperbarui:', res)
  } catch (err) {
    console.error('❌ Gagal update profil:', err)
  }
}

</script>
