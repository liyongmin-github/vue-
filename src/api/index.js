//暴露并引入的原理
/* import {default as trademark} from "@/api/trademark";
{
    trademark,
}  */

//引入并暴露语法
export {default as trademark} from "@/api/product/trademark";
export {default as attr} from "@/api/product/attr";
export {default as category} from "@/api/product/category";
export {default as spu} from "@/api/product/spu";
export {default as sku} from "@/api/product/sku";
export {default as permission}  from "@/api/acl/permission";
export {default as role} from "@/api/acl/role"
export * as user from "@/api/acl/user";
