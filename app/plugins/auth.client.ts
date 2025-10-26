// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const { restore } = useAuth()
  await restore()
})
