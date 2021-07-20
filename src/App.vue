<template>
  <div id="app">
    <h1>xxx</h1>
<p class="text">xxxxxx</p>
    <router-view/>  <!-- 根路由出口 -->
    <el-row>
  <el-button>默认按钮</el-button>
  <el-button type="primary">主要按钮</el-button>
  <el-button type="success">成功按钮</el-button>
  <el-button type="info">信息按钮</el-button>
  <el-button type="warning">警告按钮</el-button>
  <el-button type="danger">危险按钮</el-button>
</el-row>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import request from '@/utils/request';

request({
  method: 'GET',
  url: '/boss/v2/api-docs?group=edu-boss-boot',   // 测试，可以收到响应
}).then(console.log);

export default Vue.extend({
  data() {
    return {
      a: 1,
    };
  },
  methods: {
    test() {
      // this.a.abc();
    },
  },
});
</script>

<style lang="scss" scoped>
.text {
  color: $success-color;
}
</style>
