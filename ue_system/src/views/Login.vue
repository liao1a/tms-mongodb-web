<template>
  <div class="login">
    <tms-login :on-success="fnOnSuccess" :on-fail="fnOnFail" class="mongo"></tms-login>
  </div>
</template>
<script>
export default {
  methods: {
    fnOnSuccess(token) {
      if (token) {
        sessionStorage.setItem('access_token', token)
        if (this.$tmsRouterHistory.canBack()) {
          this.$router.back()
        } else {
          this.$router.push({ name: 'home' })
        }
      }
    },
    fnOnFail(rsl) {
      this.$message({
        message: rsl.msg || '登录失败',
        type: 'error',
        showClose: true
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login {
  display: flex;
  justify-content: center;
  margin-top: 200px;
  .mongo {
    border: 1px solid #ddd;
  }
}
</style>
