<template>
  <Layout>
    <div class="dark:bg-gray-900">
      <article
        class="container mx-auto prose prose-indigo lg:prose-xl xl:prose-xl dark:prose-dark dark:lg:prose-xl px-4 py-12"
      >
        <h1
          class="text-3xl text-center md:text-5xl lg:text-6xl dark:text-white"
        >
          {{ $page.post.title }}
        </h1>

        <figure class="mt-10 md:mt-20 mx-auto">
          <g-image
            :alt="$page.post.og_image_description"
            :src="$page.post.og_image.src"
          />
          <figcaption
            class="text-center text-sm italic text-gray-600 mt-4 dark:text-gray-200"
          >
            {{ $page.post.og_image_description }}
          </figcaption>
        </figure>

        <div
          class="text-sm md:text-base text-gray-600 flex justify-center text-center dark:text-gray-300"
        >
          <p>{{ $page.post.author }}</p>
          <p class="px-2">|</p>
          <time class="my-auto" :datetime="$page.post.dateTime">{{
            $page.post.humanTime
          }}</time>
          <p class="px-2">|</p>
          <div
            v-for="tag in $page.post.tags"
            :key="tag.id"
            class="inline-block my-auto"
          >
            <g-link
              :to="tag.path"
              class="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0 dark:text-white dark:hover:text-black mr-1"
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
              {{ tag.id }}</g-link
            >
          </div>
          <p class="px-2">|</p>
          <p>
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              height="16"
              width="16"
              class="mr-2 dark:text-white inline"
              fill="currentColor"
              stroke="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M0 1.75A.75.75 0 01.75 1h4.253c1.227 0 2.317.59 3 1.501A3.744 3.744 0 0111.006 1h4.245a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75h-4.507a2.25 2.25 0 00-1.591.659l-.622.621a.75.75 0 01-1.06 0l-.622-.621A2.25 2.25 0 005.258 13H.75a.75.75 0 01-.75-.75V1.75zm8.755 3a2.25 2.25 0 012.25-2.25H14.5v9h-3.757c-.71 0-1.4.201-1.992.572l.004-7.322zm-1.504 7.324l.004-5.073-.002-2.253A2.25 2.25 0 005.003 2.5H1.5v9h3.757a3.75 3.75 0 011.994.574z"
              ></path>
            </svg>
            {{ $page.post.timeToRead }} minute read
          </p>
        </div>
        <hr />
        <div v-html="$page.post.content"></div>
      </article>
    </div>
    <hr />
    <contact-me />
  </Layout>
</template>

<script>
import ContactMe from "../components/ContactMe.vue";
export default {
  name: "Post",
  components: { ContactMe },
  metaInfo() {
    return {
      title: this.$page.post.title,
      meta: [
        {
          name: "description",
          content: this.$page.post.description,
        },
        {
          name: "og:description",
          content: this.$page.post.description,
        },
        {
          name: "og:title",
          content: this.$page.post.title,
        },
        {
          name: "og:image",
          content: this.$static.metadata.baseURL + this.$page.post.og_image.src,
        },
      ],
      link: [
        {
          rel: "canonical",
          content: this.$static.metadata.baseURL + this.$page.post.path,
        },
      ],
    };
  },
};
</script>

<page-query>
query Post($id: ID!) {
  post(id: $id) {
    id
    title
    content
    excerpt
    description
    tags {
      id
      title
      path
    }
    path
    humanTime : date_published(format:"Do MMMM YYYY")
    datetime : date_published(format:"ddd MMM DD YYYY hh:mm:ss zZ")
    timeToRead
    og_image
    og_image_description
    author
  }
}
</page-query>

<static-query>
query {
  metadata {
    baseURL
  }
}
</static-query>
