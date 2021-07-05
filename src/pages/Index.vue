<template>
  <Layout>
    <Hero />
    <AboutMe />
    <Specializations />
    <RecentPosts />
    <Skills />
    <ContactMe />
  </Layout>
</template>
<page-query> query ($page: Int) { posts: allPost (sortBy: "date_published", order: DESC, filter: { published: {eq: true }}, perPage: 2, page: $page) @paginate { pageInfo { totalPages currentPage } edges { node { id title description tags { id title path } path date_published timeToRead og_image } } } } </page-query>

<script>
import { Pager } from "gridsome";
import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import Specializations from "@/components/Specializations";
import RecentPosts from "@/components/RecentPosts.vue";
import Skills from "@/components/Skills.vue";
import ContactMe from "@/components/ContactMe.vue";
export default {
  metaInfo: { title: "Home" },
  components: {
    Pager,
    Hero,
    AboutMe,
    Specializations,
    RecentPosts,
    Skills,
    ContactMe,
  },
};
</script>
