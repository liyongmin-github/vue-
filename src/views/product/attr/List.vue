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
              @click="delAttr"
            ></HintButton>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 此处使用行内form -->
    <el-card style="margin-top: 20px" v-show="!isShow">
      <el-form :inline="true" :model="attrForm">
        <el-form-item label="属性名">
          <el-input
            v-model="attrForm.attrName"
            placeholder="请输入属性名"
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        icon="el-icon-plus"
        :disabled="!attrForm.attrName"
        @click="addAttrValue"
        >添加属性值</el-button
      >
      <el-button>取消</el-button>
      <el-table
        :data="attrForm.attrValueList"
        style="width: 100%; margin: 20px 0"
        border
      >
        <el-table-column label="序号" width="80" align="center" type="index">
        </el-table-column>
        <el-table-column prop="prop" label="属性值名称" width="width">
          <template v-slot="{ row, $index }">
            <el-input
              v-model="row.valueName"
              :ref="$index"
              placeholder="请输入属性值名称"
              size="mini"
              v-if="row.isEdit"
              @blur="toLook(row)"
              @keyup.enter.native="toLook(row)"
            ></el-input>
            <span
              @click="toEdit(row, $index)"
              v-if="!row.isEdit"
              style="display: block; weight: 100%"
              >{{ row.valueName }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="prop" label="操作" width="width">
          <template v-slot="{ row, $index }">
            <!-- 注意模板字串的使用，:xxx= "js语法区域" -->
            <el-popconfirm :title="`确定删除${row.valueName}吗？`" @onConfirm = "attrForm.attrValueList.splice($index,1)">
              <HintButton
                type="danger"
                slot="reference"
                icon="el-icon-delete"
                size="mini"
                title="删除属性值"
              ></HintButton>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary">保存</el-button>
      <el-button>取消</el-button>
    </el-card>
  </div>
</template>
<script>
import cloneDeep from "lodash/cloneDeep"; //使用lodash中的cloneDeep函数提供的深拷贝功能

export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShow: true,
      attrForm: {
        attrName: "",
        attrValueList: [
          {
            /*  attrId:'',
          valueName:'' */
          },
        ],
        categoryId: 0,
        categoryLevel: 3,
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
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id, //此处的categoryId就是category3Id
        categoryLevel: 3,
      };
    },
    //添加属性值
    addAttrValue() {
      //点击新增，就在数组中新增一项
      this.attrForm.attrValueList.push({
        //在数组中先占位(先新增一行input，保证用户可以输入数据)
        //attrId和attrForm中的id值是一致的
        attrId: this.attrForm.id, //attrForm中的id在修改数据的时候才能获取到，新增的时候是undefined
        valueName: "",
        //在添加属性值的时候为每一个新增的属性值上都携带一个新的属性标识：isEdit,用于查看模式和编辑模式的切换（span/input）
        //确保在每个属性上都有添加，便于到时候针对每个属性值都能单独进行模式切换
        isEdit: true, //新增属性值中式通过push在数组中新增数据的，因此数组内的数据都是响应式的
      });

      //每次添加属性的时候自动获取焦点肯定每次都是给数组this.refs对象名称为数组下标最后最后一个设置获取焦点事件
      //上方的push方法同样涉及到dom的更新，要使用nexTick,否则直接通过this.refs[]获取到的input时undefined
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus();
      });
    },

    //更新attr（进入属性值编辑页面）
    attrEdit(row) {
      //console.log("更新attr");
      //先展示属性值新增页面
      this.isShow = false;
      //另外需要把对应行的数据深拷贝到attrForm中，这样才能在原有数据的基础上编辑(更新)数据
      this.attrForm = cloneDeep(row); //row中的数据

      //在属性值编辑页面需要遍历attrForm中旧的attrValueList，为每个旧的attrValueList的对象新增一个isEdit属性
      //在旧的对象中新增属性需要使用$set,否则就不是响应式数据了
      this.attrForm.attrValueList.forEach((item) =>
        this.$set(item, "isEdit", false)
      );
    },

    //点击span,切换到input(查看模式--->编辑模式)
    toEdit(row, index) {
      //console.log("toEdit");
      row.isEdit = true; //dom要重新渲染
      //在编辑模式下自动获取焦点，注意在$nextTick(()=>{})，必须在最上面最近的dom更新完成后才执行回调函数
      //使用el-input组件内置的方法，需要通过ref获取dom节点调用这个方法
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },

    //input失去焦点，或者使用enter键时抓为查看模式
    toLook(row) {
      //1.在转为查看模式之前注意判断input中输入的内容不为空
      if (row.valueName.trim() === "") {
        //this.$message.error('输入请不要为空！！！');//注意每次新增多个新的input的时候会自动失去一次焦点
        //同时清空内容
        return (row.valueName = "");
      }

      //2.确保input中输入的内容和除了自己之外的其他属性值都不相同(使用数组的some,根据地址比较是否为同一个对象)
      const isRepeat = this.attrForm.attrValueList.some((item) => {
        if (item !== row) {
          //通过地址比较是否为同一个对象
          return item.valueName === row.valueName;
        }
      });
      if (isRepeat) {
        this.$message.error("您输入的内容已重复！！！");
        //同时清空输入框内容
        return (row.valueName = "");
      }

      row.isEdit = false;
    },

    //删除属性
    delAttr(){

    }
  },
};
</script>
<style>
</style>