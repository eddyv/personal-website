<template>
  <div class="layout">
    <DefaultHeader />
    <main>
      <slot />
    </main>
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
