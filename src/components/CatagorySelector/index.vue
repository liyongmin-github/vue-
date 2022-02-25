<template>
  <!-- 使用行内form表单构建三级分类选择器组件 -->
  <!-- 注意@change后是回调函数，不是函数调用,change事件不要绑定错位置，是在select上的 -->
  <el-form :inline="true" class="demo-form-inline">
    <el-form-item label="一级分类">
      <el-select
        placeholder="请选择"
        v-model="category1Id"
        @change="selectCatagory1"
      >
        <el-option
          :label="cat1.name"
          :value="cat1.id"
          v-for="cat1 in category1List"
          :key="cat1.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="二级分类">
      <el-select
        placeholder="请选择"
        v-model="category2Id"
        @change="selectCatagory2"
      >
        <el-option
          :label="cat2.name"
          :value="cat2.id"
          v-for="cat2 in category2List"
          :key="cat2.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="三级分类">
      <el-select
        placeholder="请选择"
        v-model="category3Id"
        @change="selectCatagory3"
      >
        <el-option
          :label="cat3.name"
          :value="cat3.id"
          v-for="cat3 in category3List"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  //定义组件
  name: "CatagorySelector",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      category1List: [],
      category2List: [],
      category3List: [],
    };
  },
  mounted() {
    this.reqcategory1List();
  },
  methods: {
    //初始请求category1List
    async reqcategory1List() {
      const re = await this.$API.category.getCategory1List();
      try {
        if (re.code === 20000 || re.code === 200) {
          this.category1List = re.data;
        } else {
          this.$message.error("获取一级类别数据失败");
        }
      } catch (e) {
        this.$message.error("请求获取一级类别数据失败");
      }
    },

    //select组件中选择的值改变触发的回调函数
    async selectCatagory1(category1Id) {
      //参数是目前选中的值

      //选择一级目录前，先清除2,3级目录数据
      this.category2Id = "";
      this.category3Id = "";
      this.category2List = [];
      this.category3List = [];

      //向父组件传递1级目录的catagoryId（使用这种参数传递方法在父组件中需要同样进行其他级数据的清除）
      this.$emit("getCategoryId", { categoryId: category1Id, level: 1 });//

      //当在一级分类中选择了某项的时候就会触发二级分类列表的请求
      const re = await this.$API.category.getCategory2List(category1Id);
      try {
        if (re.code === 20000 || re.code === 200) {
          this.category2List = re.data;
        } else {
          this.$message.error("获取二级类别数据失败");
        }
      } catch (e) {
        this.$message.error("请求获取二级类别数据失败");
      }
    },

    //选择二级目录
    async selectCatagory2(category2Id) {
      //选择二级目录前，先清空3级目录
      this.category3Id = "";
      this.category3List = [];
      this.$emit("getCategoryId", { categoryId: category2Id, level: 2 });

      const re = await this.$API.category.getCategory3List(category2Id);
      try {
        if (re.code === 20000 || re.code === 200) {
          this.category3List = re.data;
        } else {
          this.$message.error("获取三级类别数据失败");
        }
      } catch (e) {
        this.$message.error("请求获取三级类别数据失败");
      }
    },

    //选择三级目录
    selectCatagory3(category3Id) {
      //console.log("category3Id",category3Id);
      this.$emit("getCategoryId", { categoryId: category3Id, level: 3 });
    },
  },
};
</script>

<style>
</style>