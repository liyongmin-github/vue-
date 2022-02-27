<template>
  <div>
    <el-card>
      <!-- 使用自定义事件获取CatagorySelector子组件传递的值 -->
      <CatagorySelector
        :isShow="isShow"
        @getCategoryId="getCategoryId"
      ></CatagorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <div v-show="!isShowSpuForm && !isShowSkuFrom">
        <el-button type="primary" icon="el-icon-plus" :disabled = "!category3Id" @click="addSpu">添加SPU</el-button>
        <el-table :data="spuList" style="width: 100%" border>
          <el-table-column label="序号" type="index" width="80">
          </el-table-column>
          <el-table-column prop="spuName" label="spu名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="spu描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template v-slot = "{row,$index}">
              <HintButton
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加SKU"
                @click="addSku"
              ></HintButton>
              <HintButton
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改SPU"
                @click = "updateSpu(row.id)"
              ></HintButton>
              <HintButton
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看SPU的SKU列表"
              ></HintButton>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除SPU"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="regGetSpuList"
          :current-page="page"
          :pager-count="5"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
          style="text-align: center"
        >
        </el-pagination>
      </div>
      <SpuForm v-show="isShowSpuForm" ref="spuform"></SpuForm>
      <SkuForm v-show="isShowSkuFrom"></SkuForm>

    </el-card>
  </div>

</template>
<script>
import SkuForm from "./components/SkuForm.vue";
import SpuForm from "./components/SpuForm.vue";

export default {
  name: "Spu",
  components: {
    SkuForm,
    SpuForm,
  },
  data() {
    return {
      isShow: true,
      page: 1,
      limit: 3,
      total: 0,
      category1Id: "",
      category2Id: "",
      category3Id: "",
      spuList: [],
      isShowSpuForm: false,
      isShowSkuFrom: false,
    };
  },
  methods: {
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      this.limit = val;
      //需要重新请求spu列表
      this.regGetSpuList();
    },
    getCategoryId({ categoryId, level }) {
      switch (level) {
        case 1:
          this.category1Id = categoryId;
          this.category2Id = "";
          this.category3Id = "";
          this.spuList = [];
          break;
        case 2:
          this.category2Id = categoryId;
          this.category3Id = "";
          this.spuList = [];
          break;
        default:
          this.category3Id = categoryId;
          //发送请求获取spuList
          this.regGetSpuList();
      }
    },

    //发送分页请求的函数
    async regGetSpuList(curPage = 1) {
      //console.log(curPage);
      this.page = curPage; //将pagination中点击页码事件合并到改请求函数中(注意使用默认值);

      const { page, limit, category3Id } = this;
      try {
         const re = await this.$API.spu.getList(page, limit, category3Id);
        if (re.code === 20000 || re.code === 200) {
          this.spuList = re.data.records;
          this.total = re.data.total;
        } else {
          this.$message.error("查询spu列表失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询spu列表失败!!!");
      }
    },

    //修改SPU
    updateSpu(spuId){
      this.isShow = false;
      this.isShowSpuForm = true;
      //在子组件上使用ref,这可以通过this.$refs.xxx获取子组件实例，使用子组件上的属性和方法
      
      //调用子组件上的方法获取spuInfo
      this.$refs.spuform.reqGetSpuInfo(spuId);
      
      //获取品牌列表
      this.$refs.spuform.reqGetTradeList();

      //获取spuImageList
      this.$refs.spuform.reqGetSpuImageList(spuId);

      //获取baseSaleAttrList
      this.$refs.spuform.reqSaleAttrList();

    },

    //添加SPU
    addSpu(){
      this.isShowSpuForm = true;
      this.isShow = false;

      //获取品牌列表
      this.$refs.spuform.reqGetTradeList();
      //获取baseSaleAttrList
      this.$refs.spuform.reqSaleAttrList();
    },

    //添加sku
    addSku(){
      this.isShowSkuFrom = true;
    },

    
  },
};
</script>
<style>
</style>