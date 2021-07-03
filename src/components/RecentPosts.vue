<template>
  <div class="dark:bg-gray-900">
    <h1
      class="w-full text-5xl font-bold leading-tight text-gray-800 text-center pt-14 dark:text-white"
    >
      Recent Blog Posts
    </h1>
    <div class="flex mt-6 justify-center">
      <div class="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
    </div>
    <section
      class="text-gray-600 dark:text-white"
      v-if="$page.posts.edges.length"
      :posts="$page.posts.edges"
    >
      <div class="container px-5 py-24 mx-auto">
        <div class="flex flex-wrap -m-4">
          <div
            v-for="edge in $page.posts.edges"
            :key="edge.node.id"
            class="p-6 md:w-1/2"
          >
            <div
              class="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden dark:bg-indigo-500 dark:border-indigo-800"
            >
              <g-image
                class="lg:h-48 md:h-36 w-full object-cover object-center"
                alt="blogPost"
                :src="edge.node.og_image"
              />
              <div class="p-6">
                <h2
                  class="tracking-widest text-xs font-medium text-gray-400 dark:text-gray-100 mb-1 uppercase"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 inline-block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {{ edge.node.tags }}
                </h2>
                <g-link :to="edge.node.path">
                  <h1
                    class="text-lg font-semibold text-gray-900 mb-3 dark:text-white"
                  >
                    {{ edge.node.title }}
                  </h1></g-link
                >
                <p class="leading-relaxed mb-3 line-clamp-3">
                  {{ edge.node.description }}
                </p>
                <div class="flex items-center flex-wrap ">
                  <g-link
                    :to="edge.node.path"
                    class="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0 dark:text-white dark:hover:text-black"
                    >Learn More
                    <svg
                      class="w-5 h-5 ml-2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </g-link>
                  <span
                    class="text-gray-400 dark:text-white inline-flex items-center lg:ml-auto md:ml-0 ml-auto leading-none text-sm pl-3 py-1 border-l-2 border-gray-200"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      height="16"
                      width="16"
                      class="mr-2 dark:text-white"
                      fill="currentColor"
                      stroke="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75V1.75zm8.755 3a2.25 2.25 0 012.25-2.25H14.5v9h-3.757c-.71 0-1.4.201-1.992.572l.004-7.322zm-1.504 7.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 011.994.574z"
                      ></path></svg
                    >{{ edge.node.timeToRead }} Minute(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div v-else><h3>Nothing here yet...</h3></div>
    <Pager
      ariaLabel="Blog pagination navigation"
      class="flex flex-row items-center justify-center py-4 mt-4 w-full"
      linkClass="font-medium mx-2 p-2"
      :info="$page.posts.pageInfo"
    />
  </div>
</template>

<script>
import { Pager } from "gridsome";
export default {
  components: { Pager },
};
</script>
