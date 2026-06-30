<template>
  <div class="home-page safe-area-bottom">
    <!-- Search Bar -->
    <div class="search-bar" @click="goSearch">
      <div class="search-inner">
        <span class="search-placeholder">搜索</span>
      </div>
    </div>

    <!-- Banner Carousel -->
    <Swiper
      class="banner"
      :autoplay="{ delay: 4000 }"
      :loop="true"
      :pagination="{ clickable: true }"
    >
      <SwiperSlide v-for="item in banners" :key="item.id" @click="onBannerClick(item)">
        <img :src="item.imageUrl" alt="Banner" class="banner-img" />
      </SwiperSlide>
    </Swiper>

    <!-- Notice Bar -->
    <div v-if="notices.length" class="notice-bar" @click="showNoticeList = true">
      <div class="notice-label">
        <img :src="noticeIconUrl" class="notice-label-icon" />
        <span class="notice-label-text">公告</span>
      </div>
      <Swiper
        class="notice-swiper"
        direction="vertical"
        :autoplay="{ delay: 3500, disableOnInteraction: false }"
        :loop="true"
        :speed="500"
        :allowTouchMove="false"
      >
        <SwiperSlide v-for="item in notices" :key="item.id">
          <div class="notice-swiper-item">
            <span class="notice-title">{{ item.title }}</span>
          </div>
        </SwiperSlide>
      </Swiper>
      <span class="notice-more">{{ notices.length }}条 ></span>
    </div>

    <!-- Notice List Popup (Modal) -->
    <div v-if="showNoticeList" class="notice-list-mask" @click="showNoticeList = false">
      <div class="notice-list-popup" @click.stop>
        <div class="notice-list-header">
          <span class="notice-list-title">平台公告</span>
          <span class="notice-list-close" @click="showNoticeList = false">✕</span>
        </div>
        <ScrollView scroll-y class="notice-list-body">
          <div
            v-for="item in notices"
            :key="item.id"
            class="notice-list-item"
            @click="openNoticeDetail(item)"
          >
            <div class="notice-list-dot"></div>
            <div class="notice-list-info">
              <span class="notice-list-name">{{ item.title }}</span>
              <span class="notice-list-time">{{ formatTime(item.createTime) }}</span>
            </div>
            <span class="notice-list-arrow">></span>
          </div>
        </ScrollView>
      </div>
    </div>

    <!-- Category Grid -->
    <div class="category-grid">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
        @click="goCategory(cat.id)"
      >
        <img :src="cat.icon || '/static/icons/分类.svg'" class="category-icon" />
        <span class="category-name">{{ cat.name }}</span>
      </div>
    </div>

    <!-- Recommend Section -->
    <div class="section">
      <div class="section-header">
        <ScrollView scroll-x class="recommend-tabs" show-scrollbar="false" scroll-with-animation>
          <button
            v-for="tab in recommendTabs"
            :key="tab.id"
            :class="['recommend-tab', { active: currentRecommendCategoryId === tab.id }]"
            @click="switchRecommendCategory(tab.id)"
          >
            {{ tab.name }}
          </button>
        </ScrollView>
      </div>
      <div class="product-grid">
        <ProductCard
          v-for="product in recommendProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>

    <!-- Customer Service Float Button -->
    <div class="cs-float-btn" @click="goCustomerService">
      <img :src="csIconUrl" class="cs-icon" />
    </div>

    <!-- Notice Popup (Modal) -->
    <div v-if="showNoticePopup" class="notice-popup" @click="closeNoticePopup">
      <div class="popup-content" @click.stop>
        <div class="popup-header">
          <span class="popup-title">公告（{{ popupCurrentIndex + 1 }}/{{ popupNotices.length }}）</span>
          <span class="popup-close" @click="closeNoticePopup">✕</span>
        </div>
        <ScrollView scroll-y class="popup-body">
          <h3 class="popup-notice-title">{{ popupNotices[popupCurrentIndex]?.title }}</h3>
          <RichText v-if="popupNotices[popupCurrentIndex]?.content" :nodes="popupNotices[popupCurrentIndex].content" />
        </ScrollView>
        <div class="popup-footer">
          <div v-if="popupNotices.length > 1" class="popup-nav">
            <button :disabled="popupCurrentIndex === 0" @click="prevNotice">上一条</button>
            <button :disabled="popupCurrentIndex === popupNotices.length - 1" @click="nextNotice">下一条</button>
          </div>
          <button class="popup-btn" @click="closeNoticePopup">我知道了</button>
        </div>
      </div>
    </div>

    <!-- Custom Tab Bar (Placeholder for now, implement as a separate component later) -->
    <CustomTabBar :current="0" />
  </div>
</template>

<script setup>
import { ref, onMounted, onShow, onPullDownRefresh } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useSiteStore } from '../stores/site' // Assuming you have a site store
import { useChatStore } from '../stores/chat'
import { getActiveBanners } from '../api/banner' // Assuming you have an API module
import { getActiveNotices } from '../api/notice'
import { getCategoryTree } from '../api/category'
import { getRecommendCategories, getRecommendProducts } from '../api/product'
import { getRemind } from '../api/message'
import { createCsSession } from '../api/chat'
import ProductCard from '../components/ProductCard.vue'
import CustomTabBar from '../components/CustomTabBar.vue' // Assuming you create this
import Swiper from 'swiper/vue' // You'll need to install and configure Swiper
import 'swiper/css' // Import Swiper styles
import 'swiper/css/pagination' // Import Swiper pagination styles if using
import { Autoplay, Pagination } from 'swiper/modules' // Import required modules

const router = useRouter()
const userStore = useUserStore()
const siteStore = useSiteStore()
const chatStore = useChatStore()

// Refs for reactive data
const banners = ref([])
const categories = ref([])
const notices = ref([])
const recommendProducts = ref([])
const recommendTabs = ref([{ id: '', name: '全部热门' }])
const currentRecommendCategoryId = ref('')
const showNoticePopup = ref(false)
const popupNotices = ref([])
const popupCurrentIndex = ref(0)
const showNoticeList = ref(false)

// Mock data or constants
const noticeIconUrl = '/path/to/notice/icon.png' // Replace with actual path
const csIconUrl = '/path/to/cs/icon.png' // Replace with actual path

// Methods
const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth() + 1}-${d.getDate()}`
}

const loadData = async () => {
  try {
    // Simulate loading options
    const opts = { loading: false }
    const [
      bannerRes,
      noticeRes,
      catRes,
      categoriesRes,
      productRes
    ] = await Promise.all([
      getActiveBanners(opts),
      getActiveNotices(opts),
      getCategoryTree(opts),
      getRecommendCategories(opts),
      getRecommendProducts(currentRecommendCategoryId.value ? { categoryId: currentRecommendCategoryId.value } : {}, opts)
    ])

    // Process responses
    if (bannerRes?.data) {
      banners.value = bannerRes.data.records || bannerRes.data || []
    }
    if (noticeRes?.data) {
      const list = noticeRes.data.records || noticeRes.data || []
      notices.value = list
      const popupList = list.filter((n) => n.popupDisplay === 1)
      if (popupList.length > 0) {
         let seenIds = [] // In Vue, you might use localStorage or another state management solution
         try {
           seenIds = JSON.parse(localStorage.getItem('seenNoticeIds')) || []
         } catch (e) {
           console.error('Failed to parse seenNoticeIds from localStorage:', e)
         }
        const unseenList = popupList.filter((n) => !seenIds.includes(String(n.id)))
        if (unseenList.length > 0) {
          popupNotices.value = unseenList
          popupCurrentIndex.value = 0
          showNoticePopup.value = true
        }
      }
    }
    if (catRes?.data) {
      categories.value = (catRes.data || []).slice(0, 8)
    }
    if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
      recommendTabs.value = [{ id: '', name: '全部热门' }, ...categoriesRes.data.map((c) => ({ id: String(c.id), name: c.name }))]
    }
    if (productRes?.data) {
      recommendProducts.value = productRes.data.records || productRes.data || []
    }
  } catch (e) {
    console.error('[HOME] load home data error', e)
  }
}

const goSearch = () => {
  router.push('/product/list?focus=1')
}

const onBannerClick = (item) => {
  if (item.linkType === 'product' && item.linkValue) {
    router.push(`/product/detail/${item.linkValue}`)
  } else if (item.linkType === 'url' && item.linkValue) {
    // Handle URL link if needed
  }
}

const goCategory = (id) => {
  if (id) {
    // Store selected category ID in localStorage or pinia
n    localStorage.setItem('selectedCategoryId', id)
  }
  // Assuming category is a tab page, navigate accordingly
  router.push('/category') 
}

const switchRecommendCategory = (id) => {
  if (currentRecommendCategoryId.value === id) return
  currentRecommendCategoryId.value = id
  const params = id ? { categoryId: id } : {}
  getRecommendProducts(params, { loading: false }).then((res) => {
    recommendProducts.value = res.data?.records || res.data || []
  }).catch(() => {
    // Handle error silently or log
  })
}

const openNoticeDetail = (item) => {
  popupNotices.value = [item]
  popupCurrentIndex.value = 0
  showNoticePopup.value = true
}

const closeNoticePopup = () => {
  showNoticePopup.value = false
  let seenIds = [] // Get from localStorage again
  try {
    seenIds = JSON.parse(localStorage.getItem('seenNoticeIds')) || []
  } catch (e) {
    console.error('Failed to parse seenNoticeIds from localStorage:', e)
  }
  popupNotices.value.forEach((n) => {
    if (n.id && !seenIds.includes(String(n.id))) {
      seenIds.push(String(n.id))
    }
  })
  localStorage.setItem('seenNoticeIds', JSON.stringify(seenIds))
}

const prevNotice = () => {
  if (popupCurrentIndex.value > 0) {
    popupCurrentIndex.value--
  }
}

const nextNotice = () => {
  if (popupCurrentIndex.value < popupNotices.value.length - 1) {
    popupCurrentIndex.value++
  }
}

const goCustomerService = async () => {
  if (!userStore.checkLogin()) return
  try {
    const res = await createCsSession()
    const session = res.data
    router.push(`/chat/room?sessionId=${session.id}&name=${encodeURIComponent('在线客服')}`)
  } catch (e) {
    alert(e?.msg || '连接客服失败') // Use a proper toast notification library in real implementation
  }
}

// Lifecycle hooks
onMounted(() => {
  loadData()
})

// Note: onShow, onPullDownRefresh are specific to uni-app/page lifecycle.
// In Vue 3 + Vue Router, you'd typically handle refresh logic differently,
// perhaps by watching route changes or adding a pull-to-refresh directive/component.
// This is a simplified adaptation.
// onShow(() => { ... }) // Not directly applicable
// onPullDownRefresh(() => { ... }) // Not directly applicable

// Simulate onShow behavior on route enter
router.afterEach((to) => {
  if (to.name === 'Index') { // Check if navigating to Index
    // Refresh data if needed when returning to page
    // loadData() // Call only if necessary
    // Also check for unread messages if user is logged in
    if (userStore.token) {
      getRemind({ loading: false }).then((res) => {
        const d = res.data || {}
        chatStore.setUnreadFromServer(d.messageUnread ?? 0)
        chatStore.setSystemUnreadFromServer(d.systemUnread ?? 0)
      }).catch(() => {
        // Handle error silently or log
      })
    }
  }
})

// Swiper modules configuration
const modules = [Autoplay, Pagination]

// Share functions would also differ in Vue 3 context
// onShareAppMessage, onShareTimeline are uni-app specific
</script>

<style scoped>
/* Add your styles here, adapting from the original wxss */
.home-page {
  /* Styles for the main container */
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom); /* For safe area bottom */
}

.search-bar {
  /* Styles for the search bar */
  padding: 10px;
  background-color: white;
}

.banner {
  /* Styles for the banner carousel */
  height: 200px; /* Adjust height as needed */
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notice-bar {
  /* Styles for the notice bar */
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.category-grid {
  /* Styles for the category grid */
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns */
  gap: 10px;
  padding: 10px;
}

.section {
  /* Styles for sections like recommendations */
  padding: 10px;
}

.recommend-tabs {
  /* Styles for the recommendation tabs */
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
}

.recommend-tab {
  /* Styles for individual recommendation tabs */
  padding: 5px 10px;
  margin-right: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.recommend-tab.active {
  background-color: #ff4544;
  color: white;
}

.product-grid {
  /* Styles for the product grid */
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns for products */
  gap: 10px;
  margin-top: 10px;
}

.cs-float-btn {
  /* Styles for the customer service float button */
  position: fixed;
  bottom: 80px; /* Adjust based on tabbar height */
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: #ff4544;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.notice-popup, .notice-list-mask {
  /* Styles for popups */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  /* Styles for popup content */
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  max-width: 90%;
  max-height: 80%;
  overflow-y: auto;
}

/* Add more specific styles as needed */
</style>
