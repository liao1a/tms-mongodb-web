<template>
  <el-dialog :visible.sync="dialogVisible" :show-close="false" :destroy-on-close="destroyOnClose" :close-on-click-modal="closeOnClickModal">
    <tms-flex direction="column" :elastic-items="[1]" style="height:100%">
      <tms-flex>
        <el-select v-if="!fixedDbName" v-model="criteria.database" placeholder="选择数据库" clearable filterable remote :remote-method="listDbByKw" :loading="criteria.databaseLoading" style="width:240px">
          <el-option v-for="item in criteria.databases" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
          <el-option :disabled="true" value="" v-if="criteria.dbBatch.pages>1">
            <el-pagination :current-page="criteria.dbBatch.page" :total="criteria.dbBatch.total" :page-size="criteria.dbBatch.size" layout="prev, next" @current-change="changeDbPage">
            </el-pagination>
          </el-option>
        </el-select>
        <el-select v-if="fixedClName!==true" v-model="criteria.collection" placeholder="请选择集合" clearable filterable remote :remote-method="listClByKw" :loading="criteria.collectionLoading" style="width:240px">
          <el-option v-for="item in criteria.collections" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
          <el-option :disabled="true" value="" v-if="criteria.clBatch.pages>1">
            <el-pagination :current-page="criteria.clBatch.page" :total="criteria.clBatch.total" :page-size="criteria.clBatch.size" layout="prev, next" @current-change="changeClPage">
            </el-pagination>
          </el-option>
        </el-select>
      </tms-flex>
    </tms-flex>
    <div slot="footer">
      <div>
        <el-button type="primary" @click="confirm">确定</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import Vue from 'vue'
import { Batch, startBatch } from 'tms-vue'
import { Flex } from 'tms-vue-ui'
import { Dialog, Select, Option, Button, Pagination } from 'element-ui'
import { db } from '../../../ue_admin/src/apis'

Vue.use(Flex)
Vue.use(Dialog).use(Select).use(Option).use(Button).use(Pagination)

// 查找条件下拉框分页包含记录数
const SELECT_PAGE_SIZE = 7

// 创建api调用对象方法
let fnCreateDbApi, fnCreateClApi

const componentOptions = {
  name: 'DialogSelectCollection',
  props: {
    bucketName: String,
    fixedDbName: String,
    fixedClName: String,
    tmsAxiosName: String,
    dialogVisible: { type: Boolean, default: true },
  },
  data() {
    return {
      destroyOnClose: true,
      closeOnClickModal: false,
      criteria: {
        databaseLoading: false,
        databases: [],
        dbBatch: new Batch(),
        database: '',
        collections: [],
        collection: '',
        clBatch: new Batch(),
      },
    }
  },
  methods: {
    listDbByKw(keyword) {
      this.criteria.dbBatch = startBatch(this.batchDatabase, [keyword], {
        size: SELECT_PAGE_SIZE,
      })
    },
    changeDbPage(page) {
      this.criteria.dbBatch.goto(page)
    },
    batchDatabase(keyword, batchArg) {
      this.criteria.databaseLoading = true
      return fnCreateDbApi(this.TmsAxios(this.tmsAxiosName))
        .list(this.bucketName, {
          keyword,
          ...batchArg,
        })
        .then((result) => {
          this.criteria.databaseLoading = false
          this.criteria.databases = result.databases.map((db) => {
            return { value: db.name, label: `${db.title} (${db.name})` }
          })
          return result
        })
    },
    listClByKw(keyword) {
      this.criteria.clBatch = startBatch(this.batchCollection, [keyword], {
        size: SELECT_PAGE_SIZE,
      })
    },
    batchCollection(keyword, batchArg) {
      this.criteria.collectionLoading = true
      if (this.criteria.database) {
        return fnCreateClApi(this.TmsAxios(this.tmsAxiosName))
          .list(this.bucketName, this.criteria.database, {
            keyword,
            ...batchArg,
          })
          .then((result) => {
            this.criteria.collections = result.collections.map((cl) => {
              return { value: cl.name, label: `${cl.title} (${cl.name})` }
            })
            this.criteria.collectionLoading = false
            return result
          })
      } else {
        this.criteria.collections = []
        this.criteria.collectionLoading = false
        return Promise.resolve({ total: 0 })
      }
    },
    changeClPage(page) {
      this.criteria.clBatch.goto(page)
    },
    confirm() {
      this.$emit('confirm', {
        db: this.criteria.database,
        cl: this.criteria.collection,
      })
      this.$destroy()
    },
  },
  watch: {
    'criteria.database': function () {
      this.criteria.collection = null
      this.criteria.clBatch = startBatch(this.batchCollection, [null], {
        size: SELECT_PAGE_SIZE,
      })
    },
  },
  mounted() {
    document.body.appendChild(this.$el)
    let { criteria } = this
    if (this.fixedDbName) {
      criteria.database = this.fixedDbName
      if (this.fixedClName) criteria.collection = this.fixedClName
    } else {
      criteria.dbBatch = startBatch(this.batchDatabase, [null], {
        size: SELECT_PAGE_SIZE,
      })
    }
  },
  beforeDestroy() {
    document.body.removeChild(this.$el)
  },
}
export default componentOptions
/**
 * 支持作为独立组件加载
 */
export function createAndMount(Vue, propsData, apiCreators) {
  // 只有指定了数据库时才能指定集合
  if (!propsData.fixedDbName && propsData.fixedClName)
    propsData.fixedClName = null

  // 指定使用的api
  fnCreateDbApi = apiCreators.createDbApi
  fnCreateClApi = apiCreators.createClApi

  const CompClass = Vue.extend(componentOptions)
  return new CompClass({
    propsData,
  }).$mount()
}
</script>
<style lang="less" scoped>
.el-dialog__wrapper {
  /deep/ .el-dialog {
    width: 600px;
  }
  /deep/ .el-dialog__header {
    display: none;
  }
  /deep/ .el-dialog__body {
    height: 150px;
    padding-bottom: 0;
    .el-select {
      .el-input {
        width: 100%;
      }
    }
  }
}
</style>