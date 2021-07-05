<template>
  <Layout>
    <div class="dark:bg-gray-900">
      <section
        class="container mx-auto px-4 py-12"
      >
        <h1
          class="text-3xl text-center md:text-5xl lg:text-6xl dark:text-white"
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
          {{ $page.tag.title }}
        </h1>

        <div
          v-for="edge in $page.tag.belongsTo.edges"
          :key="edge.node.id"
          class="p-6 md:w-1/2 mx-auto"
        >
          <post-card :edge="edge" />
        </div>
      </section>
    </div>
  </Layout>
</template>

<page-query>
query Tag($id: ID!) {
  tag(id: $id) {
    title
    id
    path
    belongsTo {
      edges {
        node {
          ... on Post {
            id
            title
            content
            excerpt
            description
            path
            humanTime : date_published(format:"Do MMMM YYYY")
            datetime : date_published(format:"ddd MMM DD YYYY hh:mm:ss zZ")
            timeToRead
            og_image
            og_image_description
            author
            tags {
              id
              title
              path
            }
          }
        }
      }
    }
  }
}
</page-query>

<script>
import PostCard from "~/components/PostCard.vue";
export default {
  components: {
    PostCard,
  },
};
</script>
