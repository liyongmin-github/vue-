import {
  login,
  logout,
  getInfo
} from '@/api/user'
import {
  getToken,
  setToken,
  removeToken
} from '@/utils/auth'

import {
  resetRouter,
  constantRoutes,
  asyncRoutes,
  anyRoute,
  default as router
} from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '', //头像
  //用户信息中的用户权限数据
  buttons: [],
  roles: [],
  routes: [], //用来给layout中的sidebar组件遍历展示导航栏使用
}

const mutations = {
  RESET_STATE: (state) => {
    state.token = '';
    state.name = '';
    state.avatar = '';
    state.buttons = [];
    state.roles = [];
    state.routes = [];
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERINFO(state, userInfo) {
    //除了routes外，其他用户数据都已保存到state中
    state.name = userInfo.name;
    state.avatar = userInfo.avatar;
    state.buttons = userInfo.buttons;
    state.roles = userInfo.roles;
  },
  SET_ROUTES(state, privaAsyncRoutes) {

    //需要是完整的routes
    state.routes = constantRoutes.concat(privaAsyncRoutes, anyRoute); //routes是需要给菜单栏遍历的，因此包含所有的路由（常量，异步，任意）
    // 动态添加路由到路由器当中
    router.addRoutes([...privaAsyncRoutes, anyRoute]); //路由动态添加到路由器只需要添加异步和任意路由； 
  }

}

const actions = {
  // user login
  login({
    commit
  }, userInfo) {
    const {
      username,
      password
    } = userInfo
    return new Promise((resolve, reject) => {
      login({
        username: username.trim(),
        password: password
      }).then(response => {
        const {
          data
        } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  async getInfo({
    commit,
    state
  }) {
    const re = await getInfo(state.token);
    if (re.code === 20000 || re.code === 200) {
      commit('SET_USERINFO', re.data);
      commit('SET_ROUTES', filterAsyncRoutes(asyncRoutes, re.data.routes)); //re.data.routes中是当前用户携带的相关路由的name数组
      return 'ok';
    } else {
      return Promise.reject(new Error('filed'));
    }
  },

  // user logout
  logout({
    commit,
    state
  }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({
    commit
  }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

//定义一个函数用来在asyncRoutes(异步路由)中过滤当前用户自己的异步路由
function filterAsyncRoutes(allAsyncRoutes, privRouteNames) {
  //从总的异步路由数组中过滤出路由name在privRouteNames中的路由，返回过滤得到的新数组
  //在过滤过程中需要考虑allAsyncRoutes有子路由的情况，需要递归进行过滤，
  const privaAsyncRoutes = allAsyncRoutes.filter(item => {
    if (privRouteNames.indexOf(item.name) !== -1) {
      //获取allAsyncRoutes符合的一级路由
      //如果满足条件的一级路由下还有二级路由(且不是空数组)，需要对二级路由进行递归过滤
      if (item.children && item.children.length) {
        item.children = filterAsyncRoutes(item.children, privRouteNames);
      }
      return true;
    }

  });
  return privaAsyncRoutes;
}



export default {
  namespaced: true, //开启命名空间
  state,
  mutations,
  actions
}
