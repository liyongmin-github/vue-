<template>
  <!-- 这个组件是在spu页面下展示新增sku的页面 -->
  <div>
    <el-form label-width="100px">
      <el-form-item label="SPU名称">
        {{ spuName }}
      </el-form-item>

      <el-form-item label="SKU名称">
        <el-input v-model="model" placeholder="SKU名称"></el-input>
      </el-form-item>

      <el-form-item label="价格(元)">
        <el-input
          v-model="model"
          placeholder="价格(元)"
          type="number"
        ></el-input>
      </el-form-item>

      <el-form-item label="重量(千克)">
        <el-input
          v-model="model"
          placeholder="重量(千克)"
          type="number"
        ></el-input>
      </el-form-item>

      <el-form-item label="规格描述">
        <el-input
          v-model="model"
          rows="4"
          placeholder="规格描述"
          type="textarea"
        ></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="attr.attrName" v-for="(attr,index) in attrInfoList">
            <el-select v-model="model" placeholder="请选择">
              <el-option :label="item.valueName" value="value" v-for="item in attr.attrValueList"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="salAttr.saleAttrName" v-for="(salAttr,index) in spuSaleAttrList">
            <el-select v-model="model" placeholder="请选择">
              <el-option :label="item.saleAttrValueName" value="value" v-for="item in salAttr.spuSaleAttrValueList"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table :data="spuImageList" border style="width: 100%">
          <el-table-column type="selection" align="center" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="图片" width="width">
              <template v-slot="{row,$index}">
                <img :src="row.imgUrl" alt="" style="height:80px;width:80px">
              </template>
          </el-table-column>
          <el-table-column prop="prop" label="名称" width="width">
              <template v-slot="{row,$index}">
                  {{row.imgName}}
              </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
              <template v-slot="{row,$index}">
                 <el-button type="primary" size="mini">设为默认</el-button>
              </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      model: "", //临时
    
      attrInfoList: [],
      spuSaleAttrList: [],
      spuImageList: [],
      spuName: "",
    };
  },
  methods: {
    //进入skuForm页面的初始化数据请求
    InitSkuFormReq(category1Id, category2Id, spu) {
      this.spuName = spu.spuName;
      //dev-api/admin/product/attrInfoList/2/13/61
      const promise1 = this.$API.attr.getAttrList(
        category1Id,
        category2Id,
        spu.category3Id
      );

      //dev-api/admin/product/spuSaleAttrList/6
      const promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);

      //dev-api/admin/product/spuImageList/6
      const promise3 = this.$API.sku.getSpuImageList(spu.id);

        //注意使用promise.all方法返回的是promise对象
      Promise.all([promise1, promise2, promise3])
        .then((val) => {
          console.log(val);
          if (val[0].code === 20000 || val[0].code === 200) {
            this.attrInfoList = val[0].data;
            this.spuSaleAttrList = val[1].data;
            this.spuImageList = val[2].data;
          } else {
            this.$message.error("初始化数据失败！");
          }
        })
        .catch((reason) => {
          console.log(reason);
          this.$message.error("请求初始化数据失败", reason);
        });
    },
    
    //取消按钮
    cancel() {
      this.$emit("update:visible", false);
    },
  },
};
</script>
<style>
</style>