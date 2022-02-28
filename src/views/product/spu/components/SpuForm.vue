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
              : '无可选属性了！'
          "
        >
          <el-option
            :label="item.name"
            :value="`${item.id}:${item.name}`"
            v-for="item in unSelectedSaleAttr"
            :key="item.id"
          ></el-option>
        </el-select>

        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSaleAttr"
          :disabled="!saleAttrIdName"
          >添加销售属性</el-button
        >

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
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template v-slot="{ row, $index }">
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除销售属性"
                @click="delSaleAttr($index)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSpuInfo">保存</el-button>
        <el-button @click="cancel">取消</el-button>
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
        category3Id: "",
        description: "",
        spuName: "",
        tmId: "",
        spuImageList: [],
        spuSaleAttrList: [],
      },
      category3Id:"",
      baseSaleAttrList: [], //全部销售属性
      spuImageList: [],
      tmList: [], //item.tmName
    };
  },
  methods: {
    /* 照片墙相关方法 */

    //删除图片
    handleRemove(file, fileList) {
      //console.log(file, fileList);
      //filelist就是删除后的imagelist信息
      this.spuImageList = fileList; //收集spuImageList
    },
    //预览大图
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    //上传成功的回调
    uploadSuccess(response, file, fileList) {
      //console.log(response, file, fileList);
      this.spuImageList = fileList; //注意新增图片和原有图片在spuImageList中保存的数据样式不同
    },

    //获取spu基本信息接口请求函数调用
    async reqGetSpuInfo(spuId) {
      
      try {
        let re = await this.$API.spu.get(spuId);
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
    async reqGetTradeList(category3Id) {
      this.category3Id = category3Id;
      try {
        let re = await this.$API.trademark.getTradeList();
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
        let re = await this.$API.sku.getSpuImageList(spuId);
        if (re.code === 20000 || re.code === 200) {
          let spuImageList = re.data;
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
        let re = await this.$API.spu.getSaleAttrList();
        if (re.code === 20000 || re.code === 200) {
          this.baseSaleAttrList = re.data;
        } else {
          this.$message.error("查询baseSaleAttrList失败!!!");
        }
      } catch (e) {
        this.$message.error("请求查询baseSaleAttrList失败!!!");
      }
    },

    /* el-tag组件相关方法 */

    //删除销售属性值
    handleClose(row, index) {
      row.spuSaleAttrValueList.splice(index, 1);
    },

    //删除销售属性
    delSaleAttr(index) {
      this.spuInfo.spuSaleAttrList.splice(index, 1);
    },

    //点击添加的事件回调函数
    showInput(row) {
      //为确保点击每一行的添加，只有对应行的input会出现，给每个row上添加isEdit属性
      //此处的row对应属性列表（spuSaleAttrList）中的每一行
      //注意使用$set来保证新增属性的响应式
      this.$set(row, "isEdit", true); //在没有的时候，undefined就是false,不显示input

      //因为每次只会在一个input中输入，因此v-model对应的值可以只使用一个
      //但是同时要为每个row增加一个saleAttrValueName，用于暂存每次输入的值，便于对输入内容进行判断
      //saleAttrName每次初始设置为""
      this.$set(row, "saleAttrValueName", ""); //v-model中进行绑定

      //自动获取焦点（确保在页面更新后获取dom，调用dom上的focus方法，否则会出现undefined.focus的错误）
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

    //新增销售属性值input中的失去焦点事件触发的回调（enter事件触发的回调）
    handleInputConfirm(row) {
      //在row上收集需要的数据saleAttrValueName和baseSaleAttrId构造对象
      let { baseSaleAttrId, saleAttrValueName } = row;
      //1.需要判断input内容是否为空
      if (saleAttrValueName.trim() === "") {
        //this.$message.error("输入不能为空！");//enter键入也会失去焦点一次
        row.saleAttrValueName = ""; //清空input
        row.isEdit = false;
        return;
      }

      //2.需要判断输入的值是否和saleAttrValueList中的值有重复（本次比较前这一项还没有添加到数组中）
      let isRepeat = row.spuSaleAttrValueList.some((item) => {
        return item.saleAttrValueName === saleAttrValueName;
      });
      if (isRepeat) {
        this.$message.error("输入不能重复！");
        row.saleAttrValueName = "";
        row.isEdit = false;
        return;
      }

      //将符合条件的值push到数组中
      row.spuSaleAttrValueList.push({ baseSaleAttrId, saleAttrValueName });
      row.saleAttrValueName = "";
      row.isEdit = false;
    },

    //新增销售属性
    addSaleAttr() {
      //需要向spuInfo.spuSaleAttrList添加的结构
      /* {
        baseSaleAttrId: 0,
        saleAttrName: "string",
        spuSaleAttrValueList: [],
      } */
      //console.log(this.saleAttrIdName);//2:版本
      let [baseSaleAttrId, saleAttrName] = this.saleAttrIdName.split(":"); //数组的解构复制
      //构建插入对象
      let saleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };

      //向spuSaleAttrList中新增
      this.spuInfo.spuSaleAttrList.push(saleAttr);
      //注意清空saleAttrIdName
      this.saleAttrIdName = "";

      //注意：unSelectedSaleAttr不需要更改，因为spuSaleAttrList新增后，计算属性会自定计算得到新的unSelectedSaleAttr
    },

    //保存数据
    async saveSpuInfo() {
      //1.获取收集的参数数据
      let { spuInfo, category3Id, spuImageList } = this;

      //2.整理参数（）
      //获取category3Id
      spuInfo.category3Id = category3Id;

      //spuImageList：存在新旧数据不一致
      spuInfo.spuImageList = spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: item.imgUrl || item.response.data,
        };
      });

      //删除spuSaleAttrList多余的属性
      spuInfo.spuSaleAttrList.forEach(item => {//注意foreach的用法，更改数组中的对象是可以操作成功的；
        delete item.isEdit;
        delete item.saleAttrValueName;
      });

      //3.发送请求
      try {
        let re = await this.$API.spu.addUpdate(spuInfo);
        if (re.code === 20000 || re.code === 200) {
          this.$message.success("保存SPU数据成功");
          //保存数据成功后注意重置spuInfo数据
          this.resetData();
          this.$emit("update:visible", false);
          this.$emit("showSpu", true);
          this.$emit('saveSuccess',spuInfo.id);//需要父组件重新求情spulist
        } else {
          this.$message.error("保存SPU数据失败!!!");
        }
      } catch (e) {
        this.$message.error("请求保存SPU数据失败!!!");
      }
      //4.成功处理
      //5.失败处理
    },

    //取消保存
    cancel() {
      this.$emit("update:visible", false);
      this.$emit("showSpu", true); //三联操作符的可用性
      this.resetData();
    },

    //重置数据
    resetData() {
      Object.assign(this._data, this.$options.data()); //_data表示当前使用的data，option中得到的data是初始化的data;
    },
  },
  computed: {
    //计算得到所有销售属性中当前尚未选择的销售属性
    unSelectedSaleAttr() {
      //注意spuInfo初始化的值，如果只是一个空对象的话，初始化是计算属性会报错undefined.every()
      return this.baseSaleAttrList.filter(item1 => {
        return this.spuInfo.spuSaleAttrList.every(item2 => {
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