<template>
  <footer
    class="text-gray-600 body-font dark:bg-gray-900 dark:text-white border-t-2"
  >
    <div
      class="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col"
    >
      <a
        href="/"
        class="
          flex
          title-font
          font-medium
          items-center
          md:justify-start
          justify-center
          text-gray-900
          dark:text-white
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          stroke="currentColor"
          class="w-7 h-7 text-white p-2 bg-indigo-300 rounded dark:text-black dark:hover:text-white"
          viewBox="0 0 28 24"
        >
          <path
            d="m 2 22 l 4 0 l 5 -20 l -4 0 l -5 20 m 14 0 l 4 0 l 5 -20 l -4 0 l -5 20"
          ></path>
        </svg>
        <span class="ml-3 text-l dark:hover:text-indigo-500">{{
          $static.metadata.siteShortName
        }}</span>
      </a>
      <p
        class="
          text-xs text-gray-500
          dark:text-gray-200
          sm:ml-4
          sm:pl-4
          sm:border-l-2 sm:border-gray-500
          sm:py-1
          sm:mt-0
          mt-
        "
      >
        © {{ date }}
      </p>
      <span
        class="
          inline-flex
          sm:ml-auto
          sm:mt-0
          mt-4
          justify-center
          sm:justify-start
        "
      >
        <a
          href="https://github.com/eddyv/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-500 hover:text-indigo-500 dark:text-white dark:hover:text-indigo-500"
        >
          <svg
            fill="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-5 h-5 ml-3"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-4.466 19.59c-.405.078-.534-.171-.534-.384v-2.195c0-.747-.262-1.233-.55-1.481 1.782-.198 3.654-.875 3.654-3.947 0-.874-.312-1.588-.823-2.147.082-.202.356-1.016-.079-2.117 0 0-.671-.215-2.198.82-.64-.18-1.324-.267-2.004-.271-.68.003-1.364.091-2.003.269-1.528-1.035-2.2-.82-2.2-.82-.434 1.102-.16 1.915-.077 2.118-.512.56-.824 1.273-.824 2.147 0 3.064 1.867 3.751 3.645 3.954-.229.2-.436.552-.508 1.07-.457.204-1.614.557-2.328-.666 0 0-.423-.768-1.227-.825 0 0-.78-.01-.055.487 0 0 .525.246.889 1.17 0 0 .463 1.428 2.688.944v1.489c0 .211-.129.459-.528.385-3.18-1.057-5.472-4.056-5.472-7.59 0-4.419 3.582-8 8-8s8 3.581 8 8c0 3.533-2.289 6.531-5.466 7.59z"
            />
          </svg>
        </a>
        <a
          href="mailto:vaismanedward@gmail.com"
          class="ml-3 text-gray-500 hover:text-indigo-500 dark:text-white dark:hover:text-indigo-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5"
          >
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/edwardvaisman/"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-3 text-gray-500 hover:text-indigo-500 dark:text-white dark:hover:text-indigo-500"
        >
          <svg
            fill="currentColor"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="0"
            class="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path
              stroke="none"
              d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
            ></path>
            <circle cx="4" cy="4" r="2" stroke="none"></circle>
          </svg>
        </a>
      </span>
    </div>
  </footer>
</template>
<script>
export default {
  data() {
    return {
      date: new Date().getFullYear(),
    };
  },
};
</script>

<static-query>
query {
  metadata {
    siteName
    siteUrl
    githubUrl
    linkedInUrl
    siteShortName
  }
}
</static-query>
