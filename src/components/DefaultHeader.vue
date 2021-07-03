<template>
  <header
    class="text-gray-600 body-font sticky top-0 z-50 bg-white dark:bg-gray-900 dark:text-white bg-opacity-100 dark:bg-opacity-100 border-b-2"
  >
    <div
      class="
        container
        mx-auto
        flex flex-wrap
        p-5
        flex-col
        md:flex-row
        items-center
      "
    >
      <g-link
        to="/"
        class="
          flex
          title-font
          font-medium
          items-center
          text-gray-900
          dark:text-white
          mb-4
          md:mb-0
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          stroke="currentColor"
          class="w-7 h-7 text-white p-2 bg-indigo-500 rounded dark:text-black dark:hover:text-white"
          viewBox="0 0 28 24"
        >
          <path
            d="m 2 22 l 4 0 l 5 -20 l -4 0 l -5 20 m 14 0 l 4 0 l 5 -20 l -4 0 l -5 20"
          ></path>
        </svg>
        <span class="ml-3 text-xl dark:hover:text-indigo-500"> {{ $static.metadata.siteShortName }}</span>
      </g-link>
      <nav
        class="
          md:mr-auto
          md:ml-4
          md:py-1
          md:pl-4
          md:border-l md:border-gray-400
          flex flex-wrap
          items-center
          text-base
          justify-center
        "
      >
        <g-link class="md:mr-5 m-2 hover:text-gray-900 dark:hover:text-indigo-500">Standard View</g-link>
        <g-link class="md:mr-5 m-2 hover:text-gray-900 dark:hover:text-indigo-500"
          >Terminal View (coming soon)</g-link
        >
      </nav>
      <ThemeSwitcher />
      <a
        class="inline-flex items-center bg-indigo-500 border-0 py-1 px-3 ml-2 focus:outline-none hover:bg-gray-200 rounded text-base text-white hover:text-black mt-4 md:mt-0"
        href="https://raw.githubusercontent.com/eddyv/awesome_cv/master/Vaisman_Edward_Resume_2020.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mr-1 animate-bounce"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Resume
      </a>
    </div>
  </header>
</template>

<static-query>
query {
  metadata {
    siteName
    siteShortName
  }
}
</static-query>

<script>
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

export default {
  components: {
    ThemeSwitcher,
  },
};
</script>
