import myAxios from "@/utils/request";
export default {
    // /admin/product/getCategory1
    getCategory1List(){
        return myAxios({
            url:'/admin/product/getCategory1',
            method:'get',
        });
    },
    getCategory2List(category1Id){
        return myAxios({
            url:`/admin/product/getCategory2/${category1Id}`,
            method:'get',
        });
    },
    getCategory3List(category2Id){
        return myAxios({
            url:`/admin/product/getCategory3/${category2Id}`,
            method:'get',
        });
    },
}