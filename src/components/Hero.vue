<template>
  <section class="bg-gradient-to-bl from-white via-blue-50 to-indigo-200 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-900 pt-12">
    <!--Hero-->
    <div class="pt-18">
      <div
        class="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center"
      >
        <!--Left Col-->
        <div
          class="flex flex-col w-full md:w-3/5 justify-center items-start text-left"
        >
          <p class="tracking-widest w-full">
            <code class="p-1 dark:bg-indigo-700">GET /whoami</code>
          </p>
          <h1
            class="my-4 text-5xl font-bold leading-tight border-b-4 border-indigo-500 dark:text-white dark:border-indigo-700"
          >
            Edward Vaisman
          </h1>
          <p class="leading-normal text-2xl mb-4 dark:text-white">
            Software Developer &amp; Event Streaming Connoisseur
          </p>

          <p class="text-base tracking-widest text-justify dark:text-white">
            🐄Currently running Apache Kafka at scale
            <a
              class="text-indigo-500 inline-flex items-center font-semibold hover:text-black dark:hover:text-white"
              href="https://tucows.com/"
              target="_blank"
              rel="noopener noreferrer"
              >@Tucows</a
            ><br />
            🇨🇦 Based in Toronto, Canada.
          </p>

          <a
            class="text-indigo-500 inline-flex items-center font-semibold hover:text-black dark:hover:text-white"
            href="https://raw.githubusercontent.com/eddyv/awesome_cv/master/resume_cv.pdf"
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
              class="mr-1 animate-pulse"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            See Resume
          </a>
        </div>
        <!--Right Col-->
        <div class="w-full md:w-2/5 py-6 text-center">
          <g-image
            class="w-4/5 z-50 rounded-full mx-auto"
            src="~/assets/profile.jpg"
          />
        </div>
      </div>
    </div>
    <div class="relative">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          class="text-indigo-500 dark:text-indigo-700"
          fill="currentColor"
          fill-opacity="1"
          d="M0,160L0,160L205.7,160L205.7,160L411.4,160L411.4,224L617.1,224L617.1,192L822.9,192L822.9,64L1028.6,64L1028.6,128L1234.3,128L1234.3,32L1440,32L1440,320L1234.3,320L1234.3,320L1028.6,320L1028.6,320L822.9,320L822.9,320L617.1,320L617.1,320L411.4,320L411.4,320L205.7,320L205.7,320L0,320L0,320Z"
        ></path>
      </svg>
    </div>
  </section>
</template>
