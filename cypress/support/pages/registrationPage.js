import { authPage } from './authPage'

const openRegistrationForm = () => {
  cy.visit('https://advantageonlineshopping.com/#/register')
  cy.get('[name="usernameRegisterPage"]').should('be.visible')
}

const fillRegistrationForm = ({
  username,
  email,
  password,
  confirmPassword = password,
  includeProfile = true,
  allowOffersPromotion = false,
  acceptTerms = true,
}) => {
  cy.get('[name="usernameRegisterPage"]').type(username)
  cy.get('[name="emailRegisterPage"]').type(email)
  cy.get('[name="passwordRegisterPage"]').type(password, { log: false })
  cy.get('[name="confirm_passwordRegisterPage"]').type(confirmPassword, {
    log: false,
  })

  if (includeProfile) {
    cy.get('[name="first_nameRegisterPage"]').type('Cypress')
    cy.get('[name="last_nameRegisterPage"]').type('Tester')
    cy.get('[name="phone_numberRegisterPage"]').type('2025550147')
    cy.get('[name="countryListboxRegisterPage"]').select('United States')
    cy.get('[name="cityRegisterPage"]').type('Springfield')
    cy.get('[name="addressRegisterPage"]').type('123 Cypress Lane')
    cy.get('[name="state_/_province_/_regionRegisterPage"]').type(
      'California',
      { force: true }
    )
    cy.get('[name="postal_codeRegisterPage"]').type('90210', {
      scrollBehavior: 'center',
    })
  }

  if (allowOffersPromotion) {
    cy.get('[name="allowOffersPromotion"]')
      .check({ scrollBehavior: 'center' })
      .should('be.checked')
  }

  if (acceptTerms) {
    cy.get('[name="i_agree"]')
      .check({ scrollBehavior: 'center' })
      .should('be.checked')
  }
}

const createAccountCredentials = () => {
  const seed = Cypress._.random(100000, 999999)
  const username = `cy${seed}`

  return {
    username,
    email: `${username}@example.com`,
    password: `Pass${seed}a`,
  }
}

const registerAccount = (credentials, options = {}) => {
  openRegistrationForm()
  fillRegistrationForm({ ...credentials, ...options })
  cy.get('#register_btn').then($button => $button[0].click())
}

const createAccount = (credentials, options = {}) => {
  registerAccount(credentials, options)
  cy.visit('https://advantageonlineshopping.com/#/')
  cy.get('#menuUserLink:visible').should('contain.text', credentials.username)
  authPage.signOut()
  authPage.signIn(credentials)
}

export const registrationPage = {
  openRegistrationForm,
  fillRegistrationForm,
  createAccountCredentials,
  registerAccount,
  createAccount,
}
