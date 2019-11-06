<template>
  <el-container>
    <el-main class="sign-in-main">
      <el-row class="sign-in-content">
        <el-col>
          <el-row class="sign-in-row" type="flex" justify="center">
            <el-button class="sign-in-btn">
              <el-row :gutter="20">
                <el-col :span="2">
                  <img class="sign-in-logo" src="@/assets/google.png" />
                </el-col>
                <el-col :span="20">
                  <span class="sign-in-text">Sign in With Google</span>
                </el-col>
                <el-col :span="2"></el-col>
              </el-row>
            </el-button>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class SignIn extends Vue {}
</script>

<style scoped lang="scss">
.sign-in-main {
  display: flex;
  align-items: center;

  .sign-in-content {
    width: 100%;
    display: flex;
    justify-content: center;

    .sign-in-row {
      margin-bottom: 10px;

      .sign-in-btn {
        width: 300px;

        .sign-in-logo {
          width: 20px;
          height: 20px;
        }

        .sign-in-text {
          font-size: 20px;
        }
      }
    }
  }
}
</style>
