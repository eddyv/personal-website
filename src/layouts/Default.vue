<template>
  <div class="layout">
    <DefaultHeader />
    <transition name="fade" appear>
      <main>
        <slot />
      </main>
    </transition>
    <DefaultFooter />
  </div>
</template>

<script>
import DefaultHeader from "@/components/DefaultHeader";
import DefaultFooter from "@/components/DefaultFooter";
export default {
  components: { DefaultHeader, DefaultFooter },
};
</script>

<style>
.fade-enter-active {
  transition: opacity 0.5s;
}

.fade-enter {
  opacity: 0;
}
</style>
