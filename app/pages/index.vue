<template>
  <div>
    <div class="container py-10">
      <div class="flex flex-col ga-5">
        <div class="grid grid-cols-4 gap-6 ">
          <div v-for="post in posts?.data" class="p-4 border border-gray-300 rounded-xl bg-white hover:shadow-2xl duration-300 group">
            <nuxt-link :to="`/post/${post?.slug}`">
              <img v-if="post?.featured_image" :src="post?.featured_image" alt="Featured Image" class="mb-4 w-full h-auto rounded-lg group-hover:scale-105 duration-300">
              <h1 class=" font-medium mb-2">{{ post.title }}</h1>
              <P class="text-xs italic text-gray-400">{{ post.date }}</P>
            </nuxt-link>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
const { request } = useWpApi()
const { data: posts, pending } = await request('api/v1/posts/post')
</script>

<style></style>