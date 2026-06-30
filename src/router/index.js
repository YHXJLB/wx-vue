import { createRouter, createWebHistory } from 'vue-router'
// Define your routes based on the original app.json structure
const routes = [
  {
    path: '/',
    redirect: '/index' // Redirect to index page
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('../pages/Index.vue') // Lazy load the Index page component
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('../pages/Category.vue')
  },
  {
    path: '/product/list',
    name: 'ProductList',
    component: () => import('../pages/ProductList.vue')
  },
  {
    path: '/product/detail/:id',
    name: 'ProductDetail',
    component: () => import('../pages/ProductDetail.vue'),
    props: true // Pass route params as props
  },
  // Add more routes based on app.json
  {
    path: '/:pathMatch(.*)*', // Catch-all route for 404s (optional)
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory('/'), // Adjust base path if deployed in subdirectory
  routes
})

export default router