import { beforeEach } from 'vitest'
import { app, resetData } from '../../../server/app.js'

export function setupTestApi() {
  beforeEach(() => {
    resetData()
    global.fetch = async (url, options = {}) => {
      let target = typeof url === 'string' ? url : url.url
      if (target.startsWith('/')) {
        target = 'http://localhost' + target
      }
      return app.fetch(new Request(target, options))
    }
  })
}
