import { defineConfig } from 'vite'
import { env } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserOrOrgSite = repositoryName.endsWith('.github.io')
const pagesBasePath =
  env.GITHUB_ACTIONS === 'true' && repositoryName && !isUserOrOrgSite
    ? `/${repositoryName}/`
    : '/'

// https://vite.dev/config/
export default defineConfig({
  base: pagesBasePath,
  plugins: [react(), tailwindcss()],
})
