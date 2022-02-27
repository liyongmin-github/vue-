<template>
  <!-- 这个组件是在spu页面下展示新增，修改spu的页面 -->
  <div>
    <el-form ref="form" :model="spuForm" label-width="80px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option
            :label="item.tmName"
            :value="item.id"
            v-for="item in spuForm.tmList"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          v-model="spuForm.description"
          placeholder="SPU描述"
        ></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
        <!-- :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
           -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuForm.spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select v-model="model" :placeholder="`还有${unSelectedSaleAttr.length}个未选择`">
          <el-option
            :label="item.name"
            :value="item.id"
            v-for="item in unSelectedSaleAttr"
            :key="item.id"
          ></el-option>
        </el-select>

        <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

        <el-table :data="spuForm.spuSaleAttrList" style="width: 100%" border>
          <el-table-column label="序号" type="index" align="center" width="80">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性名称列表" width="width">
            <template v-slot="{ row, $index }">
              <el-tag
                :key="saleAttr.id"
                v-for="(saleAttr, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="handleClose(row, index)"
              >
                {{ saleAttr.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除销售属性"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      model: "", //临时
      //el-upload相关数据
      dialogImageUrl: "",
      dialogVisible: false,

      spuForm: {
        spuName: "",
        description: "",
        spuSaleAttrList: [], //这个商品spu已经选择的销售属性
        baseSaleAttrList: [], //全部销售属性
        spuImageList: [],
        tmList: [], //item.tmName
        tmId: "",
      },
      //el-tag相关数据
      inputVisible: false,
      inputValue: "",
    };
  },
  methods: {
    //照片墙相关方法
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    //获取spu基本信息接口请求函数调用
    async reqGetSpuInfo(spuId) {
      try {
        const re = await this.$API.spu.get(spuId);
        if (re.code === 20000 || re.code === 200) {
          const { spuName, description, spuSaleAttrList } = re.data;
          this.spuForm.spuName = spuName;
          this.spuForm.description = description;
          this.spuForm.spuSaleAttrList = spuSaleAttrList;
        } else {
          this.$message.error("查询spu基础信息失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询spu基础信息失败!!!");
      }
    },

    //获取tradeMarklist的接口函数调用
    async reqGetTradeList() {
      try {
        const re = await this.$API.trademark.getTradeList();
        if (re.code === 20000 || re.code === 200) {
          this.spuForm.tmList = re.data;
        } else {
          this.$message.error("查询tradeMarklist失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询tradeMarklist失败!!!");
      }
    },

    //获取spuImageList
    async reqGetSpuImageList(spuId) {
      try {
        const re = await this.$API.sku.getSpuImageList(spuId);
        if (re.code === 20000 || re.code === 200) {
          const spuImageList = re.data;
          //为每个对象新增name和url属性
          spuImageList.forEach((item) => {
            item.name = item.imgName;
            item.url = item.imgUrl;
          });
          this.spuForm.spuImageList = spuImageList; //只有在将数据复制到data中时，数据才开始变为响应式的
        } else {
          this.$message.error("查询spuImageList失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询spuImageList失败!!!");
      }
    },

    //获取baseSaleAttrList（全部的销售属性）
    async reqSaleAttrList() {
      try {
        const re = await this.$API.spu.getSaleAttrList();
        if (re.code === 20000 || re.code === 200) {
          this.spuForm.baseSaleAttrList = re.data;
        } else {
          this.$message.error("查询baseSaleAttrList失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询baseSaleAttrList失败!!!");
      }
    },

    //el-tag组件相关方法
    handleClose(row, index) {
      row.spuSaleAttrValueList.splice(index, 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.spuForm.spuSaleAttrList.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
  },
  computed: {
    //计算得到所有销售属性中当前尚未选择的销售属性
    unSelectedSaleAttr() {
      return this.spuForm.baseSaleAttrList.filter((item1) => {
        return this.spuForm.spuSaleAttrList.every((item2) => {
          return item2.saleAttrName !== item1.name;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>