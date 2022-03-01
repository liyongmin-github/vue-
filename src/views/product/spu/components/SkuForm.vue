<template>
  <!-- 这个组件是在spu页面下展示新增sku的页面 -->
  <div>
    <el-form label-width="100px">
      <el-form-item label="SPU名称">
        {{ spuName }}
      </el-form-item>

      <el-form-item label="SKU名称">
        <el-input v-model="skuInfo.skuName" placeholder="SKU名称"></el-input>
      </el-form-item>

      <el-form-item label="价格(元)">
        <el-input
          v-model="skuInfo.price"
          placeholder="价格(元)"
          type="number"
        ></el-input>
      </el-form-item>

      <el-form-item label="重量(千克)">
        <el-input
          v-model="skuInfo.weight"
          placeholder="重量(千克)"
          type="number"
        ></el-input>
      </el-form-item>

      <el-form-item label="规格描述">
        <el-input
          v-model="skuInfo.skuDesc"
          rows="4"
          placeholder="规格描述"
          type="textarea"
        ></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr, index) in attrInfoList"
            :key="attr.id"
          >
            <el-select v-model="attr.attrIdValueId" placeholder="请选择">
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="salAttr.saleAttrName"
            v-for="(salAttr, index) in spuSaleAttrList"
            :key="salAttr.id"
          >
            <!-- saleIdValueId保存在对应的salAttr上 -->
            <el-select v-model="salAttr.saleIdValueId" placeholder="请选择">
              <el-option
                :label="saleAttrValue.saleAttrValueName"
                :value="`${salAttr.id}:${saleAttrValue.id}`"
                v-for="saleAttrValue in salAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table
          :data="spuImageList"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="图片" width="width">
            <template v-slot="{ row, $index }">
              <img :src="row.imgUrl" alt="" style="height: 80px; width: 80px" />
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="名称" width="width">
            <template v-slot="{ row, $index }">
              {{ row.imgName }}
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template v-slot="{ row, $index }">
              <el-button
                v-if="row.isDefault === '0'"
                type="primary"
                size="mini"
                @click="setDefault(spuImageList, row)"
                >设为默认</el-button
              >
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      attrInfoList: [],
      spuSaleAttrList: [],
      spuImageList: [],
      spuName: "",
      spu: {},

      //需要收集的sku数据
      skuInfo: {
        //可以通过在父组件中获取
        category3Id: "",
        spuId: 0,
        tmId: 0,
        //v-model收集
        price: "",
        weight: "",
        skuDesc: "",
        skuName: "",
        skuImageList: [],
        //代码中计算收集
        skuDefaultImg: "",
        skuAttrValueList: [
          /* {
            attrId: 0,
            attrName: "string",
            id: 0,
            skuId: 0,
            valueId: 0,
            valueName: "string",
          }, */
        ],
        skuImageList: [
          /*  {
            id: 0,
            imgName: "string",
            imgUrl: "string",
            isDefault: "string",
            skuId: 0,
            spuImgId: 0,
          }, */
        ],
        skuSaleAttrValueList: [
          /*  {
            id: 0,
            saleAttrId: 0,
            saleAttrName: "string",
            saleAttrValueId: 0,
            saleAttrValueName: "string",
            skuId: 0,
            spuId: 0,
          }, */
        ],
      },
    };
  },
  methods: {
    //进入skuForm页面的初始化数据请求
    InitSkuFormReq(category1Id, category2Id, spu) {
      this.spuName = spu.spuName;
      this.spu = spu;
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
          if (val[0].code === 20000 || val[0].code === 200) {
            this.attrInfoList = val[0].data;
            this.spuSaleAttrList = val[1].data;
            const spuImageList = val[2].data;
            spuImageList.forEach((item) => {
              item.isDefault = "0"; //初始为0，都不是默认的
            });
            //执行以下操作spuImageList就变为响应式的
            this.spuImageList = spuImageList;
          } else {
            this.$message.error("初始化数据失败！");
          }
        })
        .catch((reason) => {
          this.$message.error("请求初始化数据失败", reason);
        });
    },

    //table上的选择事件
    handleSelectionChange(val) {
      //console.log(val);

      this.skuImageList = val; //选择图片的list
    },

    //设置默认图片(排他法)
    setDefault(spuImageList, row) {
      spuImageList.forEach((item) => {
        item.isDefault = "0";
      });
      row.isDefault = "1";
      this.skuInfo.skuDefaultImg = row.imgUrl; //收集默认图片url
    },
    //save
    async save() {
      //1.获取之前收集的数据
      const { attrInfoList, spuSaleAttrList, spu, skuInfo } = this;
      //2.数据整理
      //spu获取父级来源数据
      skuInfo.category3Id = spu.category3Id;
      skuInfo.spuId = spu.id;
      skuInfo.tmId = spu.tmId;

      //attrInfoList需要从上边整理出attrIdValueId
      skuInfo.skuAttrValueList = attrInfoList.reduce((prev, current) => {
        if (current.attrIdValueId) {
          const [attrId, valueId] = current.attrIdValueId.split(":");
          prev.push({ attrId, valueId });
        }
        return prev;
      }, []);

      //spuSaleAttrList需要整理出saleIdValueId
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, current) => {
        if (current.saleIdValueId) {
          const [saleAttrId, saleAttrValueId] =
            current.saleIdValueId.split(":");
          prev.push({ saleAttrId, saleAttrValueId });
        }
        return prev;
      }, []);

      //3.发送请求（成功如何，失败如何）
      try {
        const re = await this.$API.sku.addUpdate(skuInfo);
        if (re.code === 20000 || re.code === 200) {
          this.$message.success("保存sku成功！");
          //不需要重新请求spu,跳转回主页
          this.$emit('update:visible',false);
          this.resetData();
        } else {
          this.$message.error("保存sku失败！");
        }
      } catch (e) {
        this.$message.error("请求保存sku失败！");
      }
    },
    //取消按钮
    cancel() {
      this.$emit("update:visible", false);
      this.resetData();
    },

    //清空重置数据
    resetData(){
      Object.assign(this._data,this.$options.data());
    }
  },
};
</script>
<style>
</style>