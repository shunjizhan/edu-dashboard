<template>
  <div>
    Layout
    <!-- 子路由出口 -->
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'LayoutIndex',
});
</script>

<style lang="scss" scoped>
</style>
