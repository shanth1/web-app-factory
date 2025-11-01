import './styles/normalize.css'
import './styles/index.css'

import { router } from './providers/router'
import { store } from './providers/store'

import { getHomePage } from '@/4-pages/home'
import { getAboutPage } from '@/4-pages/about'
import { NavigationWidget } from '@/3-widgets/NavigationWidget'

import { registerSW } from 'virtual:pwa-register'

registerSW({ onNeedRefresh() {}, onOfflineReady() {} })

const root = document.getElementById('root')
const pageContainer = document.createElement('main')
pageContainer.id = 'page-container'

const navigation = new NavigationWidget({ router, store })
root.append(navigation.render())
root.append(pageContainer)

router.setPageContainer(pageContainer)
router.setRoutes({
	'/': getHomePage,
	'/about': getAboutPage,
})
