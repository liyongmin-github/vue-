<template>
  <!-- 这个组件是在spu页面下展示新增，修改spu的页面 -->
  <div>
    <el-form ref="form" :model="spuForm" label-width="80px">
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option :label="item.tmName" :value="item.id" v-for="item in spuForm.tmList" :key="item.id"></el-option>
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
        <el-select v-model="model" placeholder="还有1个未选择">
          <el-option label="" value=""></el-option>
        </el-select>

        <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

        <el-table :data="dataTemp" style="width: 100%" border>
          <el-table-column label="序号" type="index" align="center" width="80">
          </el-table-column>
          <el-table-column prop="prop" label="属性名" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性名称列表" width="width">
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
      model: "", //临时使用
      dataTemp: [1, 2, 3],
      dialogImageUrl: "",
      dialogVisible: false,
      spuForm: {
        spuName: "",
        description: "",
        spuSaleAttrList: [],//这个商品spu已经选择的销售属性
        spuImageList: [],
        tmList:[],//item.tmName
        tmId:'',

      },
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
          const { spuName, description, spuSaleAttrList, spuImageList } =
            re.data;
          this.spuForm.spuName = spuName;
          this.spuForm.description = description;
          this.spuForm.spuSaleAttrList = spuSaleAttrList;
        } else {
          this.$message.error("查询spu列表失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询spu列表失败!!!");
      }
    },

    //获取tradeMarklist的接口函数调用
    async reqGetTradeList(){
      try {
        const re = await this.$API.trademark.getTradeList();
        if (re.code === 20000 || re.code === 200) { 
          this.spuForm.tmList =  re.data;
        } else {
          this.$message.error("查询spu列表失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询spu列表失败!!!");
      }
    },

    //获取spuImageList
    async reqGetSpuImageList(spuId){
     try {
        const re = await this.$API.sku.getSpuImageList(spuId);
        if (re.code === 20000 || re.code === 200) { 
          const spuImageList = re.data; 
          //为每个对象新增name和url属性
          spuImageList.forEach(item => {
            item.name = item.imgName;
            item.url = item.imgUrl;
          });
          this.spuForm.spuImageList =  spuImageList;//只有在将数据复制到data中时，数据才开始变为响应式的 
        } else {
          this.$message.error("查询spu列表失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询spu列表失败!!!");
      }
    }
  },
};
</script>
<style>
</style>