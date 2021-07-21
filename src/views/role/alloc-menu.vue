<template>
  <div class="alloc-menu">
    <el-card>
      <div slot="header">
        <span>分配菜单</span>
      </div>
      <el-tree
        ref="menu-tree"
        :data="menus"
        node-key="id"
        :props="defaultProps"
        :default-checked-keys="checkedKeys"
        show-checkbox
        default-expand-all
      ></el-tree>
      <div style="text-align: center">
        <el-button @click="resetChecked">清空</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  getMenuNodeList,
  allocateRoleMenus,
  getRoleMenus
} from '@/services/menu';
import { Tree } from 'element-ui';

export default Vue.extend({
  name: 'AllocMenu',
  props: {
    roleId: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      menus: [],
      defaultProps: {
        // 自定义树形组件里面用什么data作为label和children
        children: 'subMenuList',
        label: 'name',
      },
      checkedKeys: [],
    };
  },

  async created() {
    await this.loadMenus();
    this.loadRoleMenus();
  },

  methods: {
    async loadRoleMenus() {
      const { data } = await getRoleMenus(this.roleId);
      this.checkedKeys = this.getCheckedKeys(data.data) as any;
    },

    getCheckedKeys(menus: any) : Array<any> {
      const keys: Array<any> = [];

      const _get = (_menus: Array<any>) : void => {
        _menus.forEach(({ selected, id, subMenuList }) => {
          selected && keys.push(id);
          subMenuList && _get(subMenuList);
        });
      };
      _get(menus);

      return keys;
    },

    async loadMenus() {
      const { data } = await getMenuNodeList();
      this.menus = data.data;
    },

    async onSave() {
      const menuIdList = (this.$refs['menu-tree'] as Tree).getCheckedKeys();
      await allocateRoleMenus({
        roleId: this.roleId,
        menuIdList,
      });

      this.$message.success('操作成功');
      this.$router.back();
    },

    resetChecked() {
      (this.$refs['menu-tree'] as Tree).setCheckedKeys([]);
    },
  },
});
</script>

<style lang="scss" scoped></style>
