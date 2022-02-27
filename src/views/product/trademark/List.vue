<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddLogo"
      >新增</el-button
    >
    <el-table :data="trademarkList" style="width: 100%; margin: 20px 0" border>
      <el-table-column align="center" label="序号" width="80" type="index">
      </el-table-column>

      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>

      <el-table-column label="品牌LOGO" width="width">
        <!-- 作用域插槽：数据来源于父组件，样式由父组件决定，父组件可以接受到子组件内部传递的row数据 -->
        <template v-slot="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width: 80px; height: 60px" />
        </template>
      </el-table-column>

      <el-table-column prop="prop" label="操作" width="width">
        <template v-slot="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updateTrademark(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 使用elementUI中完整分页功能
        pager-count:连续页长度（注意包括首尾的两个）
     -->
    <el-pagination
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      :total="total"
      :pager-count="7"
      layout="prev, pager, next, jumper, ->,sizes,total"
      style="text-align: center"
      @size-change="handleSizeChange"
      @current-change="reqTrademarkList"
    >
    </el-pagination>

    <!-- 使用嵌套表单的dialog实现新增静态页面 -->

    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <!-- :model="tmForm"这个属性写上是为了我们后期做表单验证而写的
      表单验证后期要验证的数据是哪个对象 -->
      <!-- form当中 ：model=对象 指定收集的数据最终放在哪 -->
      <!-- 
        Form组件的表单验证：
        Form 组件提供了表单验证的功能，只需要通过 1.rules 属性传入约定的验证规则，
        并将 Form-Item 的 2.prop 属性设置为需校验的字段名即可。 
      -->
      <el-form :model="tmForm" style="width: 80%" :rules="rules" ref="tmForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>

        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- 图片上传 -->
          <!-- 
            注意：此处图片上传获取url接口请求发送比较特殊，不是通过axios发送的，注意添加代理标识     
           -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <!-- 使用在线获取的imageUrl，才会展示图片 -->
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过2M
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "Trademark",
  data() {
    const myValidator1 = (rules, value, callback) => {
      if (value.length < 3 || value.length > 5) {
        callback(new Error("请输入长度在3-5个字符的品牌名")); //验证不通过调用带错误对象参数的callback函数
      } else {
        callback(); //验证通过直接调用不带参数的callback函数
      }
    };
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      //是否显示新增图片的静态页
      dialogFormVisible: false,
      //增加/修改请求的数据收集
      tmForm: {
        logoUrl: "",
        tmName: "",
      },
      rules: {
        //单个验证（内置规则和自定义规则，:model= xxx, rules = {xxx},prop = xxx）
        //书写表单验证的规则
        //rules中使用的数据名和form组件中:model = xxx接收的对象中的数据一一对应
        tmName: [
          //内置验证规则
          { required: true, message: "请输入品牌", trigger: "blur" },
          //使用自定义规则；自定义规则需要在data函数中书写自定义验证器
          {
            /*  min: 3,
            max: 5,
            message: "长度在 3 到 5 个字符",
            trigger: "change", */
            validator: myValidator1,
            trigger: "change",
          },
        ],
        logoUrl: [{ required: true, message: "请选择品牌LOGO图片" }],
      },
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
    /* handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.page = val; //修改page,重新发送请求
      this.reqTrademarkList(this.page);//这部分代码可以整合到reqTrademarkList中(直接将请求列表数据的函数放在原来这个页面跳转的回调函数位置)
    }, */

    //调用查询trademarkLIst的接口
    async reqTrademarkList(page = 1) {
      //此时注意给page初始值，否则monted中无参数调用就会报错
      //此时函数reqTrademarkList同时也充当了handleCurrentChange函数的作用，形参会接收当前点击的页面编号
      this.page = page;
      const re = await this.$API.trademark.getTradeMarkList(page, this.limit); //异步请求
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

    //upload组件相关回调函数
    //图片上传成功后，执行的回调函数
    handleAvatarSuccess(res, file) {
      //console.log(res,'***',file);//两个对象都可以获取到需要的数据url;
      this.tmForm.logoUrl = res.data;
    },
    //图片上传前图片格式和大小的校验
    beforeAvatarUpload(file) {
      //console.log("file.type",file.type);//image/jpeg
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },

    //点击新增，显示upload静态页面
    showAddLogo() {
      //每次点击新增之前注意先清空tmForm
      /*  this.tmForm.logoUrl = "";
      this.tmForm.tmName = ""; */
      //注意不能使用上面的写法，否则会遗留id这个数据
      this.tmForm = {
        logoUrl: "",
        tmName: "",
      };
      this.dialogFormVisible = true;
    },

    //点击添加静态页面中的确认，新增数据
    addOrUpdateTrademark() {
      //点击确定后，先进行表单数据的整体验证，验证通过后再进行后续的发请求操作
      this.$refs.tmForm.validate(async (valid) => {
        //首先进行表单验证操作，回调函数valid是验证结果
        if (valid) {
          //验证通过发送请求
          this.dialogFormVisible = false; //隐藏dialog
          //异步发送请求，新增数据
          const re = await this.$API.trademark.getAddOrUpdate(this.tmForm);
          //console.log(re.code,re.data);
          try {
            if (re.code === 20000 || re.code === 200) {
              this.$message.success(
                this.tmForm.id ? "修改数据成功" : "新增数据成功"
              );
              //完成数据新增后要重新发送获取trademarkList的请求,并展示首页
              this.reqTrademarkList(this.tmForm.id ? this.page : 1);
            } else {
              this.$message.error(
                this.tmForm.id ? "修改数据失败" : "新增数据失败"
              );
            }
          } catch (e) {
            this.$message.error(
              this.tmForm.id ? "请求修改数据失败" : "请求新增数据失败"
            );
          }
        } else {
          this.$message.error("您输入的数据不符合要求，请检查后重新提交！！！");
          return false;
        }
      });
    },

    //点击修改数据，触发事件
    updateTrademark(row) {
      //console.log(row);
      this.dialogFormVisible = true;
      this.tmForm = { ...row }; //此处注意，不能直接报row给thForm,否则修改tmFom数据会直接影响table中的数据，此处row中都是基本数据类型，使用拷贝即可(可理解为浅拷贝)
      //接下来就会复用新增数据的操作
    },

    //删除数据功能,需要使用messageBox弹出消息框
    delTrademark(row) {
      this.$confirm(`你确定要删除${row.tmName}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          //注意修改sync的位置，放在最近的函数前
          //点击确定，发送请求
          const re = await this.$API.trademark.getDel(row.id);
          try {
            if (re.code === 20000 || re.code === 200) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              //需要重新请求当前页列表数据，同时需要判断当前页数据条数
              if (this.trademarkList.length > 1) {
                this.reqTrademarkList(this.page);
              } else {
                //如果当前页条数小于等于1的时候重新请求跳转到前一页
                this.reqTrademarkList(this.page - 1);
              }
            } else {
              this.$message({
                type: "error",
                message: "删除失败!",
              });
            }
          } catch (e) {
            this.$message({
              type: "error",
              message: "请求删除失败!",
            });
          }
        })
        .catch(() => {
          //点击取消，只发送提示即可
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>