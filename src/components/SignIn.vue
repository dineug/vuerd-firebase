<template>
  <el-container>
    <ve-aside active="4" />
    <el-container>
      <el-main class="login-main">
        <el-row class="login-content">
          <el-col>
            <el-row class="login-row" type="flex" justify="center">
              <el-button class="login-btn">
                <el-row :gutter="20">
                  <el-col :span="2">
                    <img class="login-logo" src="@/assets/google.png" />
                  </el-col>
                  <el-col :span="20">
                    <span class="login-text">Sign in With Google</span>
                  </el-col>
                  <el-col :span="2"></el-col>
                </el-row>
              </el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VeAside from "./common/VeAside.vue";

@Component({
  components: {
    VeAside
  }
})
export default class SignIn extends Vue {}
</script>

<style scoped lang="scss">
.login-main {
  display: flex;
  align-items: center;

  .login-content {
    width: 100%;
    display: flex;
    justify-content: center;

    .login-row {
      margin-bottom: 10px;

      .login-btn {
        width: 300px;

        .login-logo {
          width: 20px;
          height: 20px;
        }

        .login-text {
          font-size: 20px;
        }
      }
    }
  }
}
</style>
