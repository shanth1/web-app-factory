import './styles/normalize.css'
import './styles/index.css'

import { router } from './providers/router'
import { getUserPage } from '@/pages/user'
import { HeaderWidget } from '@/widgets/HeaderWidget'
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
