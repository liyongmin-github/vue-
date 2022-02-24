<template>
  <div>
    <el-card shadow="always">
      <CatagorySelector @getCategoryId="getCategoryId"></CatagorySelector>
    </el-card>

    <el-card shadow="always" style="margin-top: 20px" v-show="isShow">
      <el-button
        type="primary"
        icon="el-icon-plus"
        :disabled="category3Id ? false : true"
        @click="addOrUpdateAttr"
        >添加属性</el-button
      >
      <el-table :data="attrList" style="width: 100%" border>
        <el-table-column label="序号" width="80" type="index" align="center">
        </el-table-column>
        <el-table-column prop="attrName" label="属性名称" width="150">
        </el-table-column>
        <el-table-column label="属性值列表" width="width">
          <template v-slot="{ row, $index }">
            <el-tag
              type="success"
              v-for="item in row.attrValueList"
              :key="item.id"
              >{{ item.valueName }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="150">
          <template v-slot="{ row, $index }">
            <HintButton
              type="warning"
              icon="el-icon-edit"
              size="mini"
              title="修改"
              @click="attrEdit(row)"
            ></HintButton>
            <HintButton
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              @click="attrDel"
            ></HintButton>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 此处使用行内form -->
    <el-card style="margin-top: 20px" v-show="!isShow">
      <el-form :inline="true" :model="attrForm">
        <el-form-item label="属性名">
          <el-input v-model="attrForm.attrName" placeholder="请输入属性名"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" icon="el-icon-plus" :disabled="!attrForm.attrName" @click="addAttrValue">添加属性值</el-button>
      <el-button>取消</el-button>
      <el-table :data="attrForm.attrValueList" style="width: 100%;margin:20px 0" border>
        <el-table-column label="序号" width="80" align="center" type="index">
        </el-table-column>
        <el-table-column prop="prop" label="属性值名称" width="width">
          <template v-slot="{row,$index}">
            <el-input v-model="row.valueName" placeholder="请输入属性值名称"></el-input>
            <!-- <el-tag type="success">{row}</el-tag> -->
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="width">
          <HintButton
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除属性值"
              @click="attrDel"
            ></HintButton>
        </el-table-column>
      </el-table>
      <el-button type="primary">保存</el-button>
      <el-button>取消</el-button>
    </el-card>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep';//使用lodash中的cloneDeep函数提供的深拷贝功能

export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      //categoryIds: {},
      attrList: [],
      isShow: true,
      attrForm:{
        attrName: "",
        attrValueList:[{
         /*  attrId:'',
          valueName:'' */
        }],
        categoryId:0,
        categoryLevel:3,
      },
      
    };
  },
  mounted() {},
  methods: {
    //使用这个方法从子组件接收catagoryId还需要进行判断和分别清空其他catagoryId;
    getCategoryId({ categoryId, level }) {
      //console.log(catagoryId, level);
      switch (level) {
        case 1:
          this.category1Id = categoryId;
          this.category2Id = "";
          this.category3Id = "";
          this.attrList = []; //注意在子组件中重新选择1,2级别后，需要清空attrList和对应id
          break;
        case 2:
          this.category2Id = categoryId;
          this.category3Id = "";
          this.attrList = [];
          break;
        default:
          this.category3Id = categoryId;
          //发送请求，获取attrList数据
          this.reqAttrList();
      }
    },
    /* getCategoryId(value) {//这种方式接收子组件传递的catagoryId不好，后期清空attrList不太好弄了
      //console.log(catagoryId, level);
      this.categoryIds = value;
      //console.log(this.categoryIds);

      //请求平台属性，思路2：在
      // if(){
      // }
    }, */
    async reqAttrList() {
      const re = await this.$API.attr.getAttrList(
        this.category1Id,
        this.category2Id,
        this.category3Id
      );
      try {
        if (re.code === 20000 || re.code === 200) {
          this.attrList = re.data;
        } else {
          this.$message.error("获取平台属性列表失败！");
        }
      } catch (e) {
        this.$message.error("请求获取平台属性列表失败！");
      }
    },
    //新增，更新attr数据
    addOrUpdateAttr() {
      this.isShow = false;
      //每次点击“添加属性”需要初始化attrForm数据（否则之前的数据还在）
      this.attrForm = {
        attrName:"",
        attrValueList:[],
        categoryId:this.category3Id,//此处的categoryId就是category3Id
        categoryLevel:3,
      }

    },
    //添加属性值
    addAttrValue(){
      //点击新增，就在数组中新增一项
      this.attrForm.attrValueList.push({
        //在数组中先占位(先新增一行input，保证用户可以输入数据)
        //attrId和attrForm中的id值是一致的
        attrId:this.attrForm.id,//attrForm中的id在修改数据的时候才能获取到，新增的时候是undefined
        valueName:"",
      });
    },

    //更新attr
    attrEdit(row) {
      //console.log("更新attr");
      //先展示属性值新增页面
      this.isShow = false;
      //另外需要把对应行的数据深拷贝到attrForm中，这样才能在原有数据的基础上编辑(更新)数据
      console.log(row);
      this.attrForm = cloneDeep(row);//row中的数据

    },

    //删除attr
    attrDel() {
      console.log("删除attr");
    },
  },
};
</script>
<style>
</style>