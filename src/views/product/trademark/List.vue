<template>
  <div style="padding: 10px">
    <el-button type="primary" icon="el-icon-plus">新增</el-button>
    <el-table :data="trademarkList" style="width: 100%; margin: 20px 0" border>
      <el-table-column align="center" label="序号" width="80" type="index">
      </el-table-column>

      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>

      <el-table-column label="品牌LOGO" width="width">
          <!-- 作用域插槽：数据来源于父组件，样式由父组件决定，父组件可以接受到子组件内部传递的row数据 -->
          <template v-slot="{row,$index}">
              <img :src="row.logoUrl" alt="" style="width:80px;height:60px;">
          </template>
      </el-table-column>

      <el-table-column prop="prop" label="操作" width="width">
          <template v-slot="{row,$index}">
              <el-button type="warning" icon="el-icon-edit" size="mini">修改</el-button>
              <el-button type="danger " icon="el-icon-delete" size="mini">删除</el-button>
          </template>
      </el-table-column>
    </el-table>

    <!-- 使用elementUI中完整分页功能
        pager-count:连续页长度（注意包括首尾的两个）
     -->
    <el-pagination
      :current-page=page
      :page-sizes="[3, 5, 10]"
      :page-size=limit
      :total=total
      :pager-count="7"
      layout="prev, pager, next, jumper, ->,sizes,total"
      style="text-align: center"
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
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
    };
  },
  mounted() {
    this.reqTrademarkList();
  },
  methods: {
    //pagination分页器中的回调函数
    //选择每页展示条数框后触发的回调事件，函数形参接收选择的条数
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      this.limit = val;
      this.reqTrademarkList();
    },
    //点击页码触发的回调函数，函数形参接收点击的当前页
    handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.page = val;//修改page,重新发送请求
      this.reqTrademarkList();
    },

    //调用查询trademarkLIst的接口
    async reqTrademarkList() {
      const re = await this.$traApi.getTradeMarkList(this.page, this.limit); //异步请求
      try {
        if (re.code === 20000 || re.code === 200) {
          //20000是mock请求返回的
          this.trademarkList = re.data.records;
          this.total = re.data.total;
        } else {
          //请求是成功的，但是获取数据失败
          this.$message.error("获取trademarkLIst失败", re.message);
        }
      } catch (e) {
        
        this.$message.error("请求trademarkLIst失败");
      }
    },
  },
};
</script>
<style>
</style>