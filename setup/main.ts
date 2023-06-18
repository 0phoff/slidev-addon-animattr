import { defineAppSetup } from '@slidev/types'
import vAnimAttr from './animattr/directive'

export default defineAppSetup(({ app }) => {
  app.use(vAnimAttr());
})