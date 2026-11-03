describe('Advantage Demo', () => {
  beforeEach(() => {
    cy.visit('https://advantageonlineshopping.com/#/')
    cy.title().should('eq', '\u00a0Advantage Shopping')
  })

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
    signOut()
    signIn(credentials)
  }

  const openAuthenticatedPaymentPage = (
    credentials = createAccountCredentials()
  ) => {
    createAccount(credentials)

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
      input.dispatchEvent(
        new inputWindow.Event('input', { bubbles: true })
      )
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

  const signOut = () => {
    cy.intercept('POST', '**/AccountLogoutRequest').as('logout')
    cy.get('#menuUserLink:visible').click({ force: true })
    cy.get('#loginMiniTitle').should('be.visible').then($menu => {
      const signOutButton = $menu.find('[translate="Sign_out"]')

      if (signOutButton.length) {
        cy.wrap(signOutButton).first().click({ force: true })
      } else {
        cy.contains('#loginMiniTitle [translate="Sign_out"]', 'Sign out').click({
          force: true,
        })
      }
    })
    cy.wait('@logout').its('response').should('exist')
    cy.get('#menuUserLink .hi-user').should('have.class', 'ng-hide')
  }

  const signIn = ({ username, password }) => {
    cy.get('#menuUserLink:visible').click()
    cy.get('input[name="username"]:visible').should('be.visible')
    cy.get('input[name="username"]:visible').type(username)
    cy.get('input[name="password"]:visible').should('be.visible')
    cy.get('input[name="password"]:visible').click()
    cy.get('input[name="password"]:visible').should('be.visible')
    cy.get('input[name="password"]:visible').type(password, { log: false })
    cy.get('#sign_in_btn:visible').click()
    cy.get('#menuUserLink:visible').should('contain.text', username)
  }

  const openMyAccount = () => {
    cy.get('#menuUser').click()
    cy.get('#loginMiniTitle > [translate="My_account"]').click()
    cy.location('hash').should('include', '/myAccount')
  }

  const openAccountPaymentEditor = () => {
    openMyAccount()
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

  it('cria uma conta e mantém a sessão autenticada', () => {
    const credentials = createAccountCredentials()

    registerAccount(credentials, { allowOffersPromotion: true })
    cy.visit('https://advantageonlineshopping.com/#/')
    cy.get('#menuUserLink:visible').should('contain.text', credentials.username)
  })

  it('recusa cadastro quando as senhas não coincidem', () => {
    const credentials = createAccountCredentials()

    openRegistrationForm()
    fillRegistrationForm({
      ...credentials,
      confirmPassword: `${credentials.password.slice(0, -1)}b`,
      includeProfile: false,
    })

    cy.get('#register_btn').should('be.disabled')
  })

  it('impede cadastro sem aceitar os termos de uso', () => {
    const credentials = createAccountCredentials()

    openRegistrationForm()
    fillRegistrationForm({
      ...credentials,
      includeProfile: false,
      acceptTerms: false,
    })

    cy.get('[name="i_agree"]').should('not.be.checked')
    cy.get('#register_btn').should('be.disabled')
  })

  it('permite entrar novamente após sair da conta', () => {
    const credentials = createAccountCredentials()

    registerAccount(credentials)
    cy.visit('https://advantageonlineshopping.com/#/')
    cy.get('#menuUserLink:visible').should('contain.text', credentials.username)
    signOut()
    cy.get('#menuUserLink:visible').should(
      'not.contain.text',
      credentials.username
    )
    signIn(credentials)
  })

  it('recusa login com usuário ou senha incorretos', () => {
    const credentials = createAccountCredentials()

    cy.intercept('POST', '**/AccountLoginRequest').as('login')
    cy.get('#menuUserLink:visible').click()
    cy.get('input[name="username"]:visible').type(credentials.username)
    cy.get('input[name="password"]:visible').type(credentials.password, {
      log: false,
    })
    cy.get('#sign_in_btn:visible').click()
    cy.wait('@login').its('response').should('exist')

    cy.get('#menuUserLink .hi-user').should('have.class', 'ng-hide')
    cy.get('#sign_in_btn:visible').should('be.visible')
  })

  it('impede criar novamente uma conta com o mesmo username', () => {
    const seed = Cypress._.random(100000, 999999)
    const username = `cy${seed}`

    registerAccount(
      {
        username,
        email: `${username}@example.com`,
        password: `Pass${seed}a`,
      },
      {
        includeProfile: false,
      }
    )
    cy.visit('https://advantageonlineshopping.com/#/')
    cy.get('#menuUserLink:visible').should('contain.text', username)
    signOut()

    cy.visit('https://advantageonlineshopping.com/')
    openRegistrationForm()
    fillRegistrationForm({
      username,
      email: `${username}-different@example.com`,
      password: `Pass${seed}a`,
      includeProfile: false,
    })
    cy.get('#register_btn').click()
    cy.contains('User name already exists').should('be.visible')
  })

  it('permite iniciar uma compra sem login', () => {
    cy.get('#menuUserLink .hi-user')
      .should('be.empty')
      .and('have.class', 'ng-hide')

    cy.get('#speakersImg').click()
    cy.contains('button[name="buy_now"]', 'BUY NOW').click()

    cy.get('h1:visible').should(
      'contain.text',
      'HP S9500 BLUETOOTH WIRELESS SPEAKER'
    )
    cy.get('h2:visible').should('contain.text', '$200.00')
    cy.get('input[name="quantity"]').clear().type('2')
    cy.get('button[name="save_to_cart"]').click()

    cy.get('#shoppingCartLink').trigger('mouseenter')
    cy.get('#toolTipCart:visible').within(() => {
      cy.contains('HP S9500 BLUETOOTH WIRELESS').should('be.visible')
      cy.contains('QTY: 2').should('be.visible')
      cy.contains('$400.00').should('be.visible')
      cy.get('#checkOutPopUp').click()
    })

    cy.contains('ORDER PAYMENT').should('be.visible')
    cy.get('#registration_btn').should('be.visible')
    cy.get('input[name="usernameInOrderPayment"]').should('be.visible')
    cy.get('input[name="passwordInOrderPayment"]').should('be.visible')
    cy.get('#userCart:visible').within(() => {
      cy.contains('HP S9500 BLUETOOTH WIRELESS').should('be.visible')
      cy.contains('QTY: 2').should('be.visible')
      cy.contains('$400.00').should('be.visible')
    })
    cy.get('#shoppingCartLink span.cart').should('have.text', '2')
  })

  it('impede adicionar ao carrinho uma quantidade igual a zero', () => {
    cy.get('#speakersImg').click()
    cy.contains('button[name="buy_now"]', 'BUY NOW').click()
    cy.get('input[name="quantity"]').clear().type('0')
    cy.get('input[name="quantity"]').should('have.value', '1')
  })

  it('impede pagamento com CVV incompleto', () => {
    const cardNumber = String(Cypress._.random(100000000000, 999999999999))

    openAuthenticatedPaymentPage()
    fillCardNumber(cardNumber)
    fillCvvAndExpiration('12')
    cy.get('input[name="cardholder_name"]').type('Cypress Tester', {
      force: true,
    })
    cy.get('input[name="cvv_number"]').should('have.value', '12')
    cy.get('#pay_now_btn_ManualPayment').should('be.disabled')
    cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
    cy.get('@placeOrder.all').should('have.length', 0)
  })

  it('impede pagamento com número de cartão inválido', () => {
    const invalidCardNumber = '1234'
    const cvv = String(Cypress._.random(100, 999))

    openAuthenticatedPaymentPage()
    cy.get('input[name="card_number"]')
      .clear()
      .type(invalidCardNumber, { delay: 100 })
      .should($input => {
        expect($input.val().replace(/\D/g, '')).to.have.length.lessThan(12)
      })
    fillCvvAndExpiration(cvv)
    cy.get('input[name="cardholder_name"]').type('Cypress Tester', {
      force: true,
    })
    cy.get('#pay_now_btn_ManualPayment').should('be.disabled')
    cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
    cy.get('@placeOrder.all').should('have.length', 0)
  })

  it('impede pagamento sem o nome do titular', () => {
    const cardNumber = String(Cypress._.random(100000000000, 999999999999))
    const cvv = String(Cypress._.random(100, 999))

    openAuthenticatedPaymentPage()
    fillCardNumber(cardNumber)
    fillCvvAndExpiration(cvv)
    cy.get('input[name="cardholder_name"]').should('have.value', '')
    cy.get('#pay_now_btn_ManualPayment').should('be.disabled')
    cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
    cy.get('@placeOrder.all').should('have.length', 0)
  })

  it('não oferece anos de validade de cartão expirados', () => {
    openAuthenticatedPaymentPage()
    cy.get('[name="yyyyListbox"] option').then($options => {
      const availableYears = $options
        .toArray()
        .map(option => option.textContent.trim())
        .filter(value => /^\d{4}$/.test(value))
        .map(Number)

      expect(availableYears).not.to.be.empty
      expect(
        availableYears.every(year => year >= new Date().getFullYear())
      ).to.eq(true)
    })
  })

  it('impede pagamento sem o número do cartão', () => {
    const cvv = String(Cypress._.random(100, 999))

    openAuthenticatedPaymentPage()
    fillCvvAndExpiration(cvv)
    cy.get('input[name="cardholder_name"]').type('Cypress Tester', {
      force: true,
    })
    cy.get('input[name="card_number"]').should('have.value', '')
    cy.get('#pay_now_btn_ManualPayment').should('be.disabled')
    cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
    cy.get('@placeOrder.all').should('have.length', 0)
  })

  it('impede pagamento com cartão expirado no mês anterior', () => {
    const cardNumber = String(Cypress._.random(100000000000, 999999999999))
    const cvv = String(Cypress._.random(100, 999))
    const now = new Date()
    const expirationDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const expiredMonth = String(expirationDate.getMonth() + 1).padStart(2, '0')
    const expiredYear = String(expirationDate.getFullYear())

    openAuthenticatedPaymentPage()
    cy.get('[name="yyyyListbox"] option').then($options => {
      const availableYears = $options
        .toArray()
        .map(option => option.value)

      if (!availableYears.includes(expiredYear)) {
        expect(availableYears).not.to.include(expiredYear)
        return
      }

      fillCardNumber(cardNumber)
      fillCvv(cvv)
      cy.get('[name="yyyyListbox"]').select(expiredYear)
      cy.get('[name="mmListbox"]').select(expiredMonth)
      cy.get('input[name="cardholder_name"]').type('Cypress Tester', {
        force: true,
      })

      cy.get('#pay_now_btn_ManualPayment').should('be.disabled')
      cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
      cy.get('@placeOrder.all').should('have.length', 0)
    })
  })

  it.skip('não salva o cartão no perfil quando a opção de salvamento fica desmarcada', () => {
    const credentials = createAccountCredentials()
    const cardNumber = '411111111117'
    const cvv = String(Cypress._.random(100, 999))

    openAuthenticatedPaymentPage(credentials)
    fillCardNumberDirectly(cardNumber)
    fillCvvAndExpiration(cvv)
    cy.get('input[name="cardholder_name"]').type('Cypress Tester', {
      force: true,
    })
    cy.get('input[name="save_master_credit"]')
      .uncheck()
      .should('not.be.checked')

    cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
    cy.get('#pay_now_btn_ManualPayment').should('be.enabled').click()
    cy.wait('@placeOrder', { timeout: 20000 }).then(({ response }) => {
      expect(response).to.exist
      expect(response.statusCode).to.eq(200)
      expect(response.body.success).to.eq(true)
    })

    cy.contains('Thank you for buying with Advantage').should('be.visible')
    signOut()
    signIn(credentials)
    openMyAccount()
    cy.contains('article', 'MasterCredit').should('not.exist')
  })

  it('mantém o cartão salvo após sair, entrar e editar os dados', () => {
    const seed = Cypress._.random(100000, 999999)
    const username = `cy${seed}`
    const credentials = {
      username,
      email: `${username}@example.com`,
      password: `Pass${seed}a`,
    }
    const cardNumber = String(Cypress._.random(100000000000, 999999999999))
    const updatedCardNumber = `${cardNumber.slice(0, 8)}${String(
      (Number(cardNumber.slice(-4)) + 1) % 10000
    ).padStart(4, '0')}`
    const savedPayment = {
      cardNumber,
      cvv: '123',
      month: '12',
      year: '2030',
      cardholder: 'Cypress Tester',
    }
    const updatedPayment = {
      cardNumber: updatedCardNumber,
      cvv: '456',
      month: '11',
      year: '2031',
      cardholder: 'Cypress Updated',
    }

    createAccount(credentials)
    openAccountPaymentEditor()
    saveMasterCredit(savedPayment)

    signOut()
    cy.visit('https://advantageonlineshopping.com/#/')
    signIn(credentials)
    openMyAccount()
    assertSavedMasterCredit(savedPayment)

    saveMasterCredit(updatedPayment)
    signOut()
    cy.visit('https://advantageonlineshopping.com/#/')
    signIn(credentials)
    openMyAccount()
    assertSavedMasterCredit(updatedPayment)
  })

  it('finaliza uma compra autenticada e confere o pedido em My Orders', () => {
    const seed = Cypress._.random(100000, 999999)
    const username = `cy${seed}`
    const email = `${username}@example.com`
    const password = `Pass${seed}a`
    const quantity = 3
    const cardNumber = String(Cypress._.random(100000000000, 999999999999))
    const cvv = String(Cypress._.random(100, 999))

    createAccount({ username, email, password })

    cy.get('#speakersImg').click()
    cy.contains('button[name="buy_now"]', 'BUY NOW').click()
    cy.get('input[name="quantity"]').clear().type(String(quantity))
    cy.get('button[name="save_to_cart"]').click()
    cy.get('#shoppingCartLink').trigger('mouseenter')
    cy.get('#toolTipCart:visible').within(() => {
      cy.contains('HP S9500 BLUETOOTH WIRELESS').should('be.visible')
      cy.contains(`QTY: ${quantity}`).should('be.visible')
      cy.contains('$600.00').should('be.visible')
    })
    cy.get('#checkOutPopUp').trigger('click')

    cy.contains('SHIPPING DETAILS').should('be.visible')
    cy.contains('Cypress').should('be.visible')
    cy.contains('Tester').should('be.visible')
    cy.contains('123 Cypress Lane').should('be.visible')
    cy.contains('Springfield').should('be.visible')
    cy.contains('2025550147').should('be.visible')
    cy.contains('2025550147').should('be.visible')
    cy.contains('California').should('be.visible')
    cy.contains('90210').should('be.visible')
    cy.contains('United States').should('be.visible')
    cy.get('#userCart:visible')
      .should('contain.text', 'HP S9500 BLUETOOTH WIRELESS')
      .and('contain.text', `QTY: ${quantity}`)
      .and('contain.text', '$600.00')
      .and('contain.text', '$180.00')
      .and('contain.text', '$780.00')

    cy.contains('button', 'NEXT').click()
    cy.get('.paymentMethods .imgRadioButton').eq(1).click()
    fillPaymentDetails(cardNumber, cvv)
    cy.get('#userCart:visible')
      .should('contain.text', 'HP S9500 BLUETOOTH WIRELESS')
      .and('contain.text', `QTY: ${quantity}`)
      .and('contain.text', '$600.00')
      .and('contain.text', '$180.00')
      .and('contain.text', '$780.00')
    cy.intercept('POST', '**/order/api/v1/orders/users/**').as('placeOrder')
    cy.get('#pay_now_btn_ManualPayment').click()
    cy.wait('@placeOrder').then(({ response }) => {
      expect(response).to.exist
      expect(response.statusCode).to.eq(200)
      expect(response.body.success).to.eq(true)
    })

    cy.contains('Thank you for buying with Advantage').should('be.visible')
    cy.contains('Shipping to').should('be.visible')
    cy.contains(':visible', 'Cypress Tester').should('be.visible')
    cy.contains(':visible', '123 Cypress Lane').should('be.visible')
    cy.contains('Payment method').should('be.visible')
    cy.contains('Order Summary').should('be.visible')
    cy.contains(':visible', 'HP S9500 BLUETOOTH WIRELESS').should('be.visible')
    cy.contains(':visible', `QTY: ${quantity}`).should('be.visible')
    cy.contains(':visible', '$780.00').should('be.visible')

    cy.get('#menuUser').click()
    cy.get('#loginMiniTitle > [translate="My_Orders"]')
      .should('be.visible')
      .click()
    cy.location('hash').should('include', '/MyOrders')
    cy.contains('MY ORDERS').should('be.visible')
    cy.contains('HP S9500 Bluetooth Wireless Speaker').should('be.visible')
    cy.contains('tr', '$600.00')
      .should('contain.text', 'HP S9500 Bluetooth Wireless Speaker')
      .and('contain.text', String(quantity))
  })
})
