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

          <template v-if="accessLevel == 2">
            <a-tab-pane key="4" tab="Register Account">
              <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
                <RegisterAccount/>
              </div>
            </a-tab-pane>

            <a-tab-pane key="5" tab="Manage Accounts">
              <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
                <ManageAccount @view-account="viewAccount"/>
                <a-divider/>
                <ViewEmployees :userid="userId"/>
              </div>
            </a-tab-pane>

            <a-tab-pane key="7" tab="Manage Resumes">
              <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
                <ManageResumes/>
              </div>
            </a-tab-pane>

          </template>
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
    const accessLevel = ref(0)//1 for manager, 2 for HR, if you change this manually without changing the server side, you wont get to use the functions
    const userId = ref(0)

    onMounted(async () => {
      const { data: access, pending, error, refresh} = await useAsyncData("access", () => $fetch("/server-api/access_check"), {initialCache: false});
      await refresh()

      console.log(access)

      if ((access.value as any).result == "success") {
        console.log("access at level " + (access.value as any).message)

        accessLevel.value = (access.value as any).message
      } 
      else {
        console.log("error retrieving access check, may be not logged in")
        router.push("/login");
      }
    })

    const logout = async () => {
      const { data: logout } = await useAsyncData("logout", () => $fetch("/server-api/logout"), {initialCache: false});
      if ((logout.value as any).result == "success") {
        router.push("/login")
      }
    };

    const viewAccount = async (data) => {
        console.log("received an event " + data)
        userId.value = data
    }

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
