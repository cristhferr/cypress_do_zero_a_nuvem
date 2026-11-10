import { homePage } from './homePage'
import { registrationPage } from './registrationPage'
import { authPage } from './authPage'
import { paymentPage } from './paymentPage'

export { homePage }
export { registrationPage }
export { authPage }
export { paymentPage }

export const advantagePage = {
  ...homePage,
  ...registrationPage,
  ...authPage,
  ...paymentPage,
}
