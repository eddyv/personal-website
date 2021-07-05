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
            <post-card :edge="edge"/>
          </div>
        </div>
      </div>
    </section>
    <div v-else><h3>Nothing here yet...</h3></div>
    <Pager
      ariaLabel="Blog pagination navigation"
      class="flex flex-row items-center justify-center py-4 mt-4 w-full dark:text-white"
      linkClass="font-medium mx-2 p-2"
      :info="$page.posts.pageInfo"
    />
  </div>
</template>

<script>
import { Pager } from "gridsome";
import PostCard from "@/components/PostCard";
export default {
  components: { Pager, PostCard },
};
</script>
