import { selectors } from './selectors'

Cypress.Commands.add('loginUI', (username, password) => {
  cy.visit('/login')
  cy.get(selectors.login.username).type(username)
  cy.get(selectors.login.password).type(password, { log: false })
  cy.contains('button', 'Sign in').click()
})

Cypress.Commands.add('mockLoginSuccess', () => {
  cy.intercept('POST', '**/auth/login', { fixture: 'api/login-success.json' }).as('login')
})

Cypress.Commands.add('mockLoginFailure', () => {
  cy.intercept('POST', '**/auth/login', {
    statusCode: 401,
    fixture: 'api/login-failure.json'
  }).as('login')
})

Cypress.Commands.add('mockCreateTicket', () => {
  cy.intercept('POST', '**/tickets', { fixture: 'api/create-ticket-success.json' }).as('createTicket')
})

Cypress.Commands.add('mockTicketList', () => {
  cy.intercept('GET', '**/tickets*', { fixture: 'api/ticket-list.json' }).as('getTickets')
})

Cypress.Commands.add('createTicketUI', (ticket) => {
  cy.get(selectors.ticket.newButton).click()
  cy.get(selectors.ticket.subject).type(ticket.subject)
  cy.get(selectors.ticket.description).type(ticket.description)
  cy.get(selectors.ticket.associateEmail).type(ticket.associateEmail)
  cy.get(selectors.ticket.category).select(ticket.category)
  cy.get(selectors.ticket.department).select(ticket.department)

  if (ticket.priority) {
    cy.get(selectors.ticket.priority).select(ticket.priority)
  }

  if (ticket.assignee) {
    cy.get(selectors.ticket.assignee).select(ticket.assignee)
  }

  cy.get(selectors.ticket.save).click()
})