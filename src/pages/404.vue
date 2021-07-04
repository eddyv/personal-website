<template>
  <Layout>
    <div class="dark:bg-gray-900">
      <div class="container mx-auto prose prose-indigo lg:prose-xl xl:prose-xl dark:prose-dark dark:lg:prose-xl px-4 py-12">
        <div class="pt-12 max-h-screen h-full">
          <h1 class="dark:text-white">
            404 - page not found
          </h1>
          <p class="dark:text-gray-200">
            Oops! Looks like some aliens took custody of that page!<br />Or it
            hasn't been created yet...
          </p>
          <a
            href="/"
            class="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0 dark:text-white dark:hover:text-black"
          >
            Go Back
          </a>
          <g-image
            src="~/assets/404.svg"
            class="mx-auto"
          />
        </div>
      </div>
    </div>
  </Layout>
</template>
