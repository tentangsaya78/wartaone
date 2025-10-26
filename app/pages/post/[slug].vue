<template>
  <div>
    <div class="container py-10">
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="md:col-span-2 lg:col-span-3"> <!-- kiri -->
          <div class="p-6 border border-gray-300  bg-white rounded-lg">
            <div v-if="post?.featured_image">
              <img :src="post?.featured_image" alt="Featured Image" class="mb-4 w-full h-auto rounded-lg">
            </div>
            <div class="mb-4">
              <h1 class=" font-bold text-xl lg:text-3xl ">{{ post?.title }}</h1>
              <P class="text-xs italic text-gray-400">{{ post?.date }}</P>
            </div>

            <div v-html="post?.content" class="flex flex-col gap-4"></div>
          </div>
        </div>
        <div> <!-- kanan -->

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const { request } = useWpApi()
const { user, hasRole, token } = useAuth()
const { data: post, pending } = await request(`api/v1/content/${route.params.slug}`, {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${useAuth().token.value}`,
  },
})
</script>

<style></style>