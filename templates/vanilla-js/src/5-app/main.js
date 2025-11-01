import './styles/normalize.css'
import './styles/index.css'

import { router } from './providers/router'
import { getUserPage } from '@/4-pages/user'
import { HeaderWidget } from '@/3-widgets/HeaderWidget'
import { registerSW } from 'virtual:pwa-register'

registerSW({ onNeedRefresh() {}, onOfflineReady() {} })

const root = document.getElementById('root')
const pageContainer = document.createElement('main')
pageContainer.id = 'page-container'

const header = new HeaderWidget({ router })
root.append(header.getElement())
header.componentDidMount()

root.append(pageContainer)

router.setPageContainer(pageContainer)
router.setRoutes({
	'/': getUserPage,
})
