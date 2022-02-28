<template>
  <!-- 这个组件是在spu页面下展示新增，修改spu的页面 -->
  <div>
    <el-form ref="form" label-width="100px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuInfo.spuName" placeholder="SPU名称"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
          <el-option
            :label="item.tmName"
            :value="item.id"
            v-for="item in tmList"
            :key="item.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          v-model="spuInfo.description"
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
          :file-list="spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="uploadSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          v-model="saleAttrIdName"
          :placeholder="
            unSelectedSaleAttr.length
              ? `还有${unSelectedSaleAttr.length}个未选择`
              : '没有了'
          "
        >
          <el-option
            :label="item.name"
            :value="`${item.id}:${item.name}`"
            v-for="item in unSelectedSaleAttr"
            :key="item.id"
          ></el-option>
        </el-select>

        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr">添加销售属性</el-button>

        <el-table :data="spuInfo.spuSaleAttrList" style="width: 100%" border>
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
        <el-button
          @click="
            $emit('update:visible', false);
            $emit('showSpu', true);
          "
          >取消</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      saleAttrIdName: "", //销售属性列表对象中的AttrId和name的拼接

      //el-upload相关数据
      dialogImageUrl: "",
      dialogVisible: false,

      //需要收集的skuInfo信息
      //spuSaleAttrList:这个商品spu已经选择的销售属性
      spuInfo: {
        category3Id: 0,
        description: "string",
        id: 0,
        spuImageList: [
          /* {
            imgName: "string",
            imgUrl: "string",
            spuId: 0,
          }, */
        ],
        spuName: "",
        spuSaleAttrList: [
          /* {
            baseSaleAttrId: 0,
            saleAttrName: "",
            spuSaleAttrValueList: [
              {
                baseSaleAttrId: 0,
                isChecked: "string",
                saleAttrName: "string",
                saleAttrValueName: "string",
                spuId: 0,
              },
            ],
          }, */
        ],
        tmId: 0,
      }, //spu基础信息

      baseSaleAttrList: [], //全部销售属性
      spuImageList: [],
      tmList: [], //item.tmName

      //el-tag相关数据
      inputVisible: false,
      inputValue: "",
    };
  },
  methods: {
    /* 照片墙相关方法 */
    
    //删除图片
    handleRemove(file, fileList) {
      //console.log(file, fileList);
      //filelist就是删除后的imagelist信息
      this.spuImageList = fileList;//收集spuImageList

    },
    //预览大图
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    //上传成功的回调
    uploadSuccess(response, file, fileList){
      //console.log(response, file, fileList);
      this.spuImageList = fileList;//注意新增图片和原有图片在spuImageList中保存的数据样式不同
    },

    //获取spu基本信息接口请求函数调用
    async reqGetSpuInfo(spuId) {
      try {
        const re = await this.$API.spu.get(spuId);
        if (re.code === 20000 || re.code === 200) {
          this.spuInfo = re.data; //只有修改数据才会请求spuinfo,且请求回来的skuinfo是带id的;
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
          this.tmList = re.data;
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
          this.spuImageList = spuImageList; //只有在将数据复制到data中时，数据才开始变为响应式的
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
          this.baseSaleAttrList = re.data;
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

    //新增属性值input中的失去焦点事件
    handleInputConfirm() {
      console.log("失去焦点");
    },

    //新增销售属性
    addSaleAttr(){
      //需要向spuInfo.spuSaleAttrList添加的结构
      /* {
        baseSaleAttrId: 0,
        saleAttrName: "string",
        spuSaleAttrValueList: [],
      } */
      console.log(this.saleAttrIdName);
      //const [] = this.saleAttrIdName.split

    }


  },
  computed: {
    //计算得到所有销售属性中当前尚未选择的销售属性
    unSelectedSaleAttr() {
      //注意spuInfo初始化的值，如果只是一个空对象的话，初始化是计算属性会报错undefined.every()
      return this.baseSaleAttrList.filter((item1) => {
        return this.spuInfo.spuSaleAttrList.every((item2) => {
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