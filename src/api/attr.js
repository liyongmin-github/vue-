import myAxios from "@/utils/request";

export default {
    //查询属性列表
    getAttrList(category1Id,category2Id,category3Id){
        return myAxios({
            url:`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
            method:'get'
        });
    },
    //删除属性
    getDelAttr(attrId){
        return myAxios({
            url:`/admin/product/deleteAttr/${attrId}`,
            method:'delete',
        });
    },
    //新增/更新属性
    //  /admin/product/saveAttrInfo
    getAddOrUpdateAttr(attrInfo){
        return myAxios({
            url:`/admin/product/saveAttrInfo`,
            method:'post',
            data:attrInfo
        });
    }
}