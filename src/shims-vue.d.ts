// ts本身不能识别.vue的文件
// 必须有这个适配器才能识别

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}
