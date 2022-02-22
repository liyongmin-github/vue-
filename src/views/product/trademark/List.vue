<template>
  <div style="padding: 10px">
    <el-button type="primary" icon="el-icon-plus">新增</el-button>
    <el-table :data="data" style="width: 100%; margin: 20px 0" border>
      <el-table-column
        align="center"
        prop="prop"
        label="序号"
        width="80"
        type="index"
      >
      </el-table-column>

      <el-table-column prop="prop" label="品牌名称" width="width">
      </el-table-column>

      <el-table-column prop="prop" label="品牌LOGO" width="width">
      </el-table-column>

      <el-table-column prop="prop" label="操作" width="width">
      </el-table-column>
    </el-table>

    <!-- 使用elementUI中完整分页功能
        pager-count:连续页长度（注意包括首尾的两个）

     -->
    <!--  
       
       -->
    <el-pagination
      :current-page="1"
      :page-sizes="[3, 5, 10]"
      :page-size="3"
      :total="40"
      :pager-count = "7"
      layout="prev, pager, next, jumper, ->,sizes,total"
      style="text-align:center"

      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  name: "Trademark",
  data() {
    return {
      data: ["a", "b", "c"],
    };
  },
  methods: {
    //pagination分页器中的回调函数
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    //点击页码触发的回调函数，函数
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },
  },
};
</script>
<style>
</style>