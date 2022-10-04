<template>
<div>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1">
          <pie-chart-outlined />
          <span>Dashboard</span>
        </a-menu-item>

        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <user-outlined />
              <span>Your Files</span>
            </span>
          </template>
          <a-menu-item key="3">Payroll</a-menu-item>
          <a-menu-item key="4">Medical Certificates</a-menu-item>
          <a-menu-item key="5">Receipts</a-menu-item>
        </a-sub-menu>

        <a-menu-item key="9">
          <logout-outlined />
          <span>Edit Profile</span>
        </a-menu-item>
        <a-menu-item key="10" @click="logout">
          <logout-outlined />
          <span>Logout</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-content style="margin: 0 16px">
        <a-tabs v-model:activeKey="activeKey">

          <a-tab-pane key="1" tab="View Details">
            <div
              :style="{
                padding: '24px',
                background: '#fff',
                minHeight: '360px',
              }"
            >
              <ViewAll />
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="Edit Profile" force-render>
            <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
              <EditProfile/>
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" tab="Reset Password">
            <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
              <ResetPassword/>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-layout-content>
    </a-layout>
  </a-layout>
  </div>
</template>

<script lang="ts">
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, ref } from "vue";
export default defineComponent({
  components: {
    PieChartOutlined,
    DesktopOutlined,
    UserOutlined,
    TeamOutlined,
    FileOutlined,
    LogoutOutlined,
  },
  data() {
    return {
      collapsed: ref<boolean>(false),
      selectedKeys: ref<string[]>(["1"]),
    };
  },
});
</script>

<script setup lang="ts">
const router = useRouter();
const logout = async () => {
  const { data: message } = await useAsyncData("message", () => {
    return $fetch("/server-api/logout");
  });
  router.push("/login");
  console.log(message);
};
</script>

<style>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>
