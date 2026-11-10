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
  cy.get('#loginMiniTitle').then($menu => {
    if ($menu.is(':visible')) {
      cy.get('#menuUserLink:visible').click({ force: true })
    }
  })
}

const signIn = ({ username, password }) => {
  cy.get('#menuUserLink:visible').then($menuUserLink => {
    if (!Cypress.$('input[name="username"]:visible').length) {
      cy.wrap($menuUserLink).click({ force: true })
    }
  })
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

export const authPage = {
  signOut,
  signIn,
  openMyAccount,
}
