<template>
  <a
    href="#"
    class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
    title="Toggle theme between light and dark"
    aria-label="Toggle theme between light and dark"
    @click.prevent="toggleTheme"
  >
    <Brightness4 v-if="theme === 'light'" />
    <Brightness7 v-else />
  </a>
</template>

<script>
import Brightness4 from 'vue-material-design-icons/Brightness4'
import Brightness7 from 'vue-material-design-icons/Brightness7'

export default {
  components: {
    Brightness4,
    Brightness7
  },
  data () {
    return {
      theme: ''
    }
  },
  mounted () {
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultTheme = userPrefersDark ? 'dark' : 'light'
    const theme = localStorage.getItem('theme') || defaultTheme
    this.setTheme(theme)
  },
  methods: {
    toggleTheme () {
      const newTheme = this.theme === 'light' ? 'dark' : 'light'
      this.setTheme(newTheme)
    },
    setTheme (newTheme) {
      this.theme = newTheme
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', newTheme)
    }
  }
}
</script>