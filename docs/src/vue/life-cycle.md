# Vue 生命周期详解

Vue 组件的生命周期是指从组件创建到销毁的整个过程。在这个过程中，Vue 提供了多个生命周期钩子函数，让我们可以在特定的阶段执行自定义逻辑。

## Vue 2 生命周期

### 生命周期流程图

```
new Vue()
    ↓
beforeCreate  → 初始化事件和生命周期
    ↓
created       → 初始化注入和校验
    ↓
beforeMount   → 模板编译完成，但还未挂载到 DOM
    ↓
mounted       → 组件已挂载到 DOM
    ↓
beforeUpdate  → 数据更新时触发
    ↓
updated       → DOM 更新完成
    ↓
beforeDestroy → 组件销毁前
    ↓
destroyed     → 组件已销毁
```

### 生命周期钩子详解

#### beforeCreate & created

- **beforeCreate**：实例初始化后，数据观测和事件配置前。此时无法访问 data、computed、methods
- **created**：实例创建完成，可访问 data、computed、methods，但 DOM 未挂载。常用于发起异步请求、初始化数据

```javascript
export default {
  data() {
    return { users: [] }
  },
  beforeCreate() {
    console.log("beforeCreate: 实例刚被创建")
    // this.$data 和 this.$el 都是 undefined
  },
  created() {
    console.log("created: 实例创建完成")
    this.fetchUsers() // 发起 API 请求
  },
  methods: {
    fetchUsers() {
      // 发起 API 请求
    },
  },
}
```

#### beforeMount & mounted

- **beforeMount**：挂载开始前，render 函数首次被调用。很少使用，服务端渲染时也不会调用
- **mounted**：实例挂载到 DOM 后调用。可访问 DOM 元素，进行 DOM 操作、第三方库初始化

```javascript
export default {
  mounted() {
    console.log("mounted: 组件已挂载")
    this.$refs.myElement.focus() // DOM 操作
    this.initChart() // 初始化第三方库
  },
}
```

#### beforeUpdate & updated

- **beforeUpdate**：数据更新时，虚拟 DOM 重新渲染前。可在现有 DOM 更新前访问它
- **updated**：虚拟 DOM 重新渲染和打补丁后。DOM 已更新，可执行依赖于 DOM 的操作

```javascript
export default {
  beforeUpdate() {
    console.log("beforeUpdate: 数据更新前")
  },
  updated() {
    console.log("updated: DOM 更新完成")
    // 执行依赖于新 DOM 的操作
  },
}
```

#### beforeDestroy & destroyed

- **beforeDestroy**：实例销毁前。用于清理工作，如定时器、事件监听器
- **destroyed**：实例销毁后。很少使用

```javascript
export default {
  beforeDestroy() {
    console.log("beforeDestroy: 组件销毁前")
    clearInterval(this.timer) // 清理定时器
    window.removeEventListener("resize", this.handleResize) // 移除事件监听器
  },
}
```

## Vue 3 生命周期

### 组合式 API 生命周期

Vue 3 引入了组合式 API，生命周期钩子函数也相应变化：

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
} from "vue"

export default {
  setup() {
    // 替代 beforeCreate 和 created
    console.log("setup: 组件初始化")

    onBeforeMount(() => console.log("onBeforeMount: 挂载前"))
    onMounted(() => console.log("onMounted: 已挂载"))
    onBeforeUpdate(() => console.log("onBeforeUpdate: 更新前"))
    onUpdated(() => console.log("onUpdated: 已更新"))
    onBeforeUnmount(() => console.log("onBeforeUnmount: 卸载前"))
    onUnmounted(() => console.log("onUnmounted: 已卸载"))
  },
}
```

### 选项式 API 生命周期

Vue 3 中选项式 API 的生命周期钩子名称有所变化：

```javascript
export default {
  // Vue 2: beforeCreate, created - Vue 3: 保持不变
  // Vue 2: beforeDestroy, destroyed - Vue 3: beforeUnmount, unmounted
  beforeUnmount() {
    console.log("beforeUnmount: 组件卸载前")
  },
  unmounted() {
    console.log("unmounted: 组件已卸载")
  },
}
```

## Vue 2 vs Vue 3 生命周期对比

| Vue 2         | Vue 3 (选项式) | Vue 3 (组合式)  | 说明         |
| ------------- | -------------- | --------------- | ------------ |
| beforeCreate  | beforeCreate   | setup()         | 实例初始化后 |
| created       | created        | setup()         | 实例创建完成 |
| beforeMount   | beforeMount    | onBeforeMount   | 挂载前       |
| mounted       | mounted        | onMounted       | 已挂载       |
| beforeUpdate  | beforeUpdate   | onBeforeUpdate  | 更新前       |
| updated       | updated        | onUpdated       | 已更新       |
| beforeDestroy | beforeUnmount  | onBeforeUnmount | 卸载前       |
| destroyed     | unmounted      | onUnmounted     | 已卸载       |

## Vue Router 生命周期钩子

Vue Router 提供了额外的导航守卫钩子，用于控制路由导航过程：

### 全局守卫

```javascript
// main.js
router.beforeEach((to, from, next) => {
  console.log("全局前置守卫: 路由跳转前")
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next("/login")
  } else {
    next()
  }
})

router.afterEach((to, from) => {
  console.log("全局后置钩子: 路由跳转后")
  document.title = to.meta.title || "默认标题"
})
```

### 组件内守卫

```javascript
export default {
  // 路由进入前调用，不能访问 this
  beforeRouteEnter(to, from, next) {
    console.log("beforeRouteEnter: 路由进入前")
    next((vm) => {
      console.log(vm.$data) // 通过 vm 访问组件实例
    })
  },

  // 路由更新时调用（组件被复用时）
  beforeRouteUpdate(to, from, next) {
    console.log("beforeRouteUpdate: 路由更新时")
    next()
  },

  // 路由离开前调用
  beforeRouteLeave(to, from, next) {
    console.log("beforeRouteLeave: 路由离开前")
    if (this.hasUnsavedChanges) {
      if (confirm("确定要离开吗？未保存的更改将会丢失")) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
}
```

## Keep-alive 生命周期钩子

`<keep-alive>` 是 Vue 内置的组件，用于缓存组件实例，避免重复渲染。它提供了两个特殊的生命周期钩子：

### activated & deactivated

- **activated**：被 keep-alive 缓存的组件激活时调用。用于恢复滚动位置、重新获取数据
- **deactivated**：被 keep-alive 缓存的组件停用时调用。用于保存状态、清理资源

```javascript
export default {
  data() {
    return { scrollTop: 0 }
  },

  activated() {
    console.log("activated: 组件被激活")
    this.$refs.container.scrollTop = this.scrollTop // 恢复滚动位置
    this.refreshData() // 重新获取数据
  },

  deactivated() {
    console.log("deactivated: 组件被停用")
    this.scrollTop = this.$refs.container.scrollTop // 保存滚动位置
    clearInterval(this.timer) // 清理定时器等
  },
}
```

### Vue 3 组合式 API 中的 keep-alive 钩子

```javascript
import { onActivated, onDeactivated } from "vue"

export default {
  setup() {
    const scrollTop = ref(0)

    onActivated(() => {
      console.log("onActivated: 组件被激活")
      nextTick(() => {
        container.value.scrollTop = scrollTop.value
      })
    })

    onDeactivated(() => {
      console.log("onDeactivated: 组件被停用")
      scrollTop.value = container.value.scrollTop
    })

    return { scrollTop }
  },
}
```

## 完整的生命周期执行顺序

### 首次进入页面

```
1. beforeRouteEnter (组件内守卫)
2. beforeCreate → created → beforeMount → mounted
3. beforeRouteEnter 的 next 回调
4. activated (如果被 keep-alive 包裹)
```

### 路由切换（组件被缓存）

```
1. beforeRouteLeave (离开当前路由)
2. deactivated (当前组件被停用)
3. beforeRouteEnter (进入新路由)
4. activated (新组件被激活)
5. beforeRouteEnter 的 next 回调
```

### 路由切换（组件未被缓存）

```
1. beforeRouteLeave (离开当前路由)
2. beforeDestroy → destroyed
3. beforeRouteEnter (进入新路由)
4. beforeCreate → created → beforeMount → mounted
5. beforeRouteEnter 的 next 回调
```

## 实际应用场景

### 页面缓存与数据刷新

```javascript
export default {
  data() {
    return {
      userList: [],
      lastFetchTime: null,
    }
  },

  activated() {
    // 如果数据超过5分钟，重新获取
    const now = Date.now()
    if (!this.lastFetchTime || now - this.lastFetchTime > 5 * 60 * 1000) {
      this.fetchUserList()
      this.lastFetchTime = now
    }
  },

  methods: {
    async fetchUserList() {
      this.userList = await api.getUsers()
    },
  },
}
```

### 滚动位置保持

```javascript
export default {
  data() {
    return { scrollPosition: 0 }
  },

  activated() {
    this.$nextTick(() => {
      window.scrollTo(0, this.scrollPosition)
    })
  },

  deactivated() {
    this.scrollPosition = window.pageYOffset
  },
}
```

### 权限控制

```javascript
export default {
  beforeRouteEnter(to, from, next) {
    if (hasPermission(to.meta.permission)) {
      next()
    } else {
      next("/403")
    }
  },

  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const answer = window.confirm("确定要离开吗？未保存的更改将会丢失")
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
}
```

## 注意事项

1. **Vue Router 守卫执行顺序**：全局前置守卫 → 路由独享守卫 → 组件内守卫
2. **keep-alive 钩子**：只在组件被 `<keep-alive>` 包裹时才会触发
3. **beforeRouteEnter**：不能访问 `this`，需要通过 `next` 的回调函数访问组件实例
4. **activated/deactivated**：不会在组件首次渲染时触发，只在组件被缓存后切换时触发
5. **Vue 3 组合式 API**：使用 `onActivated` 和 `onDeactivated` 替代 `activated` 和 `deactivated`

## 总结

Vue 的生命周期系统非常完善，包括：

- **基础生命周期**：组件创建、挂载、更新、销毁
- **Vue Router 守卫**：路由导航控制
- **Keep-alive 钩子**：组件缓存管理

合理使用这些生命周期钩子，可以实现数据获取和清理、权限控制、状态保持、性能优化和用户体验提升。理解这些生命周期钩子的执行时机和用途，有助于我们构建更加健壮和用户友好的 Vue 应用。
