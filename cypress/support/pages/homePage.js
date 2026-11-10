const visitHome = () => {
  cy.visit('https://advantageonlineshopping.com/#/')
  cy.title().should('eq', '\u00a0Advantage Shopping')
}

export const homePage = {
  visitHome,
}
