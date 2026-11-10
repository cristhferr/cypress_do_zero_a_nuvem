import { registrationPage } from './registrationPage'
import { authPage } from './authPage'

const openAuthenticatedPaymentPage = (
  credentials = registrationPage.createAccountCredentials()
) => {
  registrationPage.createAccount(credentials)

  cy.get('#speakersImg').click()
  cy.contains('button[name="buy_now"]', 'BUY NOW').click()
  cy.get('input[name="quantity"]').clear().type('1')
  cy.intercept('POST', '**/order/api/v1/carts/**/product/**').as('addProduct')
  cy.get('button[name="save_to_cart"]').click()
  cy.wait('@addProduct').its('response.statusCode').should('eq', 201)
  cy.get('#shoppingCartLink span.cart').should('have.text', '1')
  cy.get('#shoppingCartLink').trigger('mouseenter')
  cy.get('#toolTipCart:visible').within(() => {
    cy.get('#checkOutPopUp').click()
  })
  cy.contains('SHIPPING DETAILS').should('be.visible')
  cy.contains('button', 'NEXT').click()
  cy.get('.paymentMethods .imgRadioButton').eq(1).click()
}

const fillCardNumber = cardNumber => {
  const cardNumberInput = 'input[name="card_number"]'
  cy.get(cardNumberInput).should('be.visible').clear()
  cy.get(cardNumberInput)
    .type(cardNumber, { delay: 100 })
    .should($input => {
      const enteredNumber = $input.val().replace(/\D/g, '')
      expect(enteredNumber.slice(-4)).to.eq(cardNumber.slice(-4))
    })
}

const fillCardNumberDirectly = cardNumber => {
  const cardNumberInput = 'input[name="card_number"]'
  cy.get(cardNumberInput).should('be.visible').then($input => {
    const input = $input[0]
    const inputWindow = input.ownerDocument.defaultView
    const setValue = Object.getOwnPropertyDescriptor(
      inputWindow.HTMLInputElement.prototype,
      'value'
    ).set
    setValue.call(input, cardNumber)
    input.dispatchEvent(new inputWindow.Event('input', { bubbles: true }))
  })
  cy.get(cardNumberInput).should($input => {
    const enteredNumber = $input.val().replace(/\D/g, '')
    expect(enteredNumber).to.have.length(cardNumber.length)
    expect(enteredNumber.slice(-4)).to.eq(cardNumber.slice(-4))
  })
}

const fillPaymentDetails = (cardNumber, cvv) => {
  fillCardNumber(cardNumber)
  fillCvvAndExpiration(cvv)
  cy.get('input[name="cardholder_name"]').type('Cypress Tester', {
    force: true,
  })
}

const fillCvvAndExpiration = (cvv, year = '2030') => {
  fillCvv(cvv)
  cy.get('[name="mmListbox"]').select('12')
  cy.get('[name="yyyyListbox"]').select(year)
}

const fillCvv = cvv => {
  cy.get('input[name="cvv_number"]')
    .click()
    .clear()
    .type(cvv, { delay: 100 })
    .type('{selectall}{backspace}')
    .type(cvv, { delay: 100 })
    .should('have.value', cvv)
}

const openAccountPaymentEditor = () => {
  authPage.openMyAccount()
  cy.get('a[href="#/accountPaymentEdit"]').click()
  cy.location('hash').should('include', '/accountPaymentEdit')
  cy.get('img[alt="Master credit"]').click()
  cy.get('#creditCard').should('be.visible')
}

const saveMasterCredit = ({ cardNumber, cvv, month, year, cardholder }) => {
  fillCardNumberDirectly(cardNumber)
  fillCvv(cvv)
  cy.get('[name="mmListbox"]').select(month)
  cy.get('[name="yyyyListbox"]').select(year)
  cy.get('input[name="cardholder_name"]').clear().type(cardholder)
  cy.get('input[name="save_master_credit"]')
    .check()
    .should('be.checked')
  cy.get('[id="save_btn"]').filter(':visible').should('be.enabled').click()
  cy.location('hash').should('include', '/myAccount')
  cy.get('article')
    .should('contain.text', 'MasterCredit')
    .and('contain.text', cardNumber.slice(-4))
}

const assertSavedMasterCredit = paymentDetails => {
  cy.get('article')
    .should('contain.text', 'MasterCredit')
    .and('contain.text', paymentDetails.cardNumber.slice(-4))
  cy.get('a[href="#/accountPaymentEdit"]').click()
  cy.location('hash').should('include', '/accountPaymentEdit')
  cy.get('input[name="card_number"]').should($input => {
    const savedNumber = $input.val().replace(/\D/g, '')
    expect(savedNumber.slice(-4)).to.eq(paymentDetails.cardNumber.slice(-4))
  })
  cy.get('input[name="cvv_number"]').should('have.value', paymentDetails.cvv)
  cy.get('[name="mmListbox"] option:selected').should(
    'have.text',
    paymentDetails.month
  )
  cy.get('[name="yyyyListbox"] option:selected').should(
    'have.text',
    paymentDetails.year
  )
  cy.get('input[name="cardholder_name"]').should(
    'have.value',
    paymentDetails.cardholder
  )
}

export const paymentPage = {
  openAuthenticatedPaymentPage,
  fillCardNumber,
  fillCardNumberDirectly,
  fillPaymentDetails,
  fillCvvAndExpiration,
  fillCvv,
  openAccountPaymentEditor,
  saveMasterCredit,
  assertSavedMasterCredit,
}
