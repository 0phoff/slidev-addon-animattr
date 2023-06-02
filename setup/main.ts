import { defineAppSetup } from '@slidev/types'
import vAnimAttr from './animate'

export default defineAppSetup(({ app }) => {
  app.use(vAnimAttr())
})