//import myAxios from "@/utils/request";//简写形式
import {default as myAxios}  from "@/utils/request";

//tradeMark相关接口请求的数据只会在本组件使用，不需要保存到vuex中，因此可以将这个API放在vue的原型对象上使用
export default {
    //新增商品品牌信息
    getAddOrUpdate(trademarkInfo){
        if(trademarkInfo.id){//id存在是修改
            return myAxios.put('/admin/product/baseTrademark/update',trademarkInfo);
        }
        else{//id不存在是新增
            return myAxios({
                //参数需要放请求报文在body中
                url:'/admin/product/baseTrademark/save',
                method:'post',//注意：属性是method
                data:trademarkInfo//logoInfo是一个对象
            });
        } 
    },
    //删除商品品牌信息
    getDel(id){
        //myAxios对象的对象式写法发送请求
        return myAxios.delete(`/admin/product/baseTrademark/remove/${id}`);
    },

   /*  //修改商品品牌信息
    getEditTradeMark(trademarkInfo){ 
        //trademarkInfo为body参数
        return myAxios.put('/admin/product/baseTrademark/update',trademarkInfo);
    }, */

    //查询商品品牌列表信息
    getTradeMarkList(page,limit){
        //axios对象的函数式用法
        return myAxios({
            //参数放在请求的path中
            url:`/admin/product/baseTrademark/${page}/${limit}`,
            params:{
                //注意params中只可以写query参数形式的查询字符串
            },
            method:'get',
        });
    },

}