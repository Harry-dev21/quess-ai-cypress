// cypress/e2e/add-ticket.cy.js

import { selectors as appSelectors } from '../support/selectors'

describe('Quess Support - Add Ticket', () => {
  const selectors = appSelectors.tickets

  let testData

  before(() => {
    cy.fixture('testData').then((data) => {
      testData = data
    })
  })

  beforeEach(() => {
    const credentials = {
      email: Cypress.env('LOGIN_EMAIL') || testData.login.validEmail,
      password: Cypress.env('LOGIN_PASSWORD') || testData.login.validPassword,
    }

    cy.loginUI(credentials.email, credentials.password)
    cy.url({ timeout: 15000 }).should('not.include', '/login')

    cy.visit('/tickets')
    cy.contains(selectors.pageTitle, 'Tickets', { timeout: 15000 }).should('be.visible')
  })

  const texts = {
    signInButton: "Sign in",
    ticketsPage: "Tickets",
    createTicketPage: "Create Ticket",
    createTicketButton: "Create Ticket",

    // validation messages
    invalidEmail: "Please enter a valid email address",

    associateEmailRequired: [
      "Invalid input: expected string, received undefined",
      "Associate email is required",
    ],

    subjectRequired: [
      "Invalid input: expected string, received undefined",
      "Subject is required",
    ],

    categoryRequired: [
      "Invalid input: expected string, received undefined",
      "Category is required",
    ],

    departmentRequired: [
      "Invalid input: expected string, received undefined",
      "Department is required",
    ],

    descriptionRequired: ["Description is required"],
  };

  const data = {
    associateEmail: testData?.tickets?.associateEmail || 'qa.ticket@quess.com',
    invalidAssociateEmail: testData?.tickets?.invalidAssociateEmail || 'abc',
    description: testData?.tickets?.description || 'This ticket was created by Cypress automation.',
    priority: testData?.tickets?.priority || 'Medium',
    queryType: testData?.tickets?.queryType || 'Payroll',
  }

  function clickNewTicket() {
    cy.get(selectors.newTicketButton)
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    cy.contains(selectors.pageTitle, texts.createTicketPage, { timeout: 10000 }).should("be.visible");
  }

  function typeSubject(value) {
    cy.get(selectors.subjectInput)
      .should("be.visible")
      .clear()
      .type(value)
      .should("have.value", value);
  }

  function typeAssociateEmail(value) {
    cy.get(selectors.associateEmailInput)
      .should("be.visible")
      .clear()
      .type(value)
      .should("have.value", value);
  }

  function typeDescription(value) {
    cy.get(selectors.descriptionEditor)
      .first()
      .should("be.visible")
      .click()
      .type(value, { parseSpecialCharSequences: false });
  }

  function selectDropdownByLabel(labelText, optionText) {
    cy.contains("label", labelText)
      .parent()
      .within(() => {
        cy.get('select, [role="combobox"]').first().then(($el) => {
          const tag = $el.prop("tagName").toLowerCase();

          if (tag === "select") {
            cy.wrap($el).select(optionText);
          } else {
            cy.wrap($el).click({ force: true });
          }
        });
      });

    cy.contains("li, [role='option'], div", optionText, { timeout: 10000 })
      .should("be.visible")
      .click({ force: true });
  }

  function selectRandomOption(selector) {
    cy.get(selector)
      .should("be.visible")
      .then(($el) => {
        const tag = $el.prop("tagName").toLowerCase();

        if (tag === "select") {
          cy.wrap($el)
            .find("option")
            .then(($options) => {
              const validOptions = [...$options].filter((opt) => {
                const text = opt.text?.trim();
                const value = opt.value?.trim();
                return value && text && !/select/i.test(text);
              });

              expect(validOptions.length, `${selector} options`).to.be.greaterThan(0);

              const randomOption =
                validOptions[Math.floor(Math.random() * validOptions.length)];

              cy.wrap($el).select(randomOption.value);
            });
        } else {
          cy.wrap($el).click({ force: true });

          cy.get("li, [role='option'], div")
            .filter(":visible")
            .then(($options) => {
              const validOptions = [...$options].filter((opt) => {
                const text = opt.innerText?.trim();
                return text && !/select/i.test(text);
              });

              expect(validOptions.length, `${selector} options`).to.be.greaterThan(0);

              const randomOption =
                validOptions[Math.floor(Math.random() * validOptions.length)];

              cy.wrap(randomOption).click({ force: true });
            });
        }
      });
  }

  function clickCreateTicket() {
    cy.contains(selectors.createTicketButton, texts.createTicketButton)
      .should("be.visible")
      .and("not.be.disabled")
      .click();
  }

  function assertValidation(messages) {
    if (Array.isArray(messages)) {
      const escaped = messages.map((msg) =>
        msg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );
      const regex = new RegExp(escaped.join("|"));
      cy.contains(regex, { timeout: 10000 }).should("be.visible");
    } else {
      cy.contains(messages, { timeout: 10000 }).should("be.visible");
    }
  }

  function fillMandatoryFields(overrides = {}) {
    const ticket = {
      associateEmail: data.associateEmail,
      subject: `Automation Ticket ${Date.now()}`,
      description: data.description,
      priority: data.priority,
      queryType: data.queryType,
      selectCategory: true,
      selectDepartment: true,
      ...overrides,
    };

    if (ticket.associateEmail !== null) typeAssociateEmail(ticket.associateEmail);
    if (ticket.subject !== null) typeSubject(ticket.subject);
    if (ticket.description !== null) typeDescription(ticket.description);

    if (ticket.priority) {
      selectDropdownByLabel("Priority", ticket.priority);
    }

    if (ticket.queryType) {
      selectDropdownByLabel("Query Type", ticket.queryType);
    }

    if (ticket.selectCategory) {
      selectRandomOption(selectors.categoryDropdown);
      cy.wait(500);
    }

    if (ticket.selectDepartment) {
      selectRandomOption(selectors.departmentDropdown);
    }
  }

  function verifyTicketCreated(subject) {
    cy.visit("/tickets");
    cy.contains(selectors.pageTitle, texts.ticketsPage, { timeout: 15000 }).should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(selectors.ticketSearchInput).length) {
        cy.get(selectors.ticketSearchInput).first().clear().type(subject);
      }
    });

    cy.contains(selectors.ticketRows + ", body", subject, { timeout: 15000 }).should("be.visible");
  }

  it("TC01 - should open Create Ticket page", () => {
    clickNewTicket();
  });

  it("TC02 - should show validation for invalid associate email", () => {
    clickNewTicket();

    fillMandatoryFields({
      associateEmail: data.invalidAssociateEmail,
    });

    clickCreateTicket();
    assertValidation(texts.invalidEmail);
  });

  it("TC03 - should show validation when associate email is blank", () => {
    clickNewTicket();

    fillMandatoryFields({
      associateEmail: null,
    });

    clickCreateTicket();
    assertValidation(texts.associateEmailRequired);
  });

  it("TC04 - should show validation when subject is blank", () => {
    clickNewTicket();

    fillMandatoryFields({
      subject: null,
    });

    clickCreateTicket();
    assertValidation(texts.subjectRequired);
  });

  it("TC05 - should show validation when category is blank", () => {
    clickNewTicket();

    fillMandatoryFields({
      selectCategory: false,
    });

    clickCreateTicket();
    assertValidation(texts.categoryRequired);
  });

  it("TC06 - should show validation when department is blank", () => {
    clickNewTicket();

    fillMandatoryFields({
      selectDepartment: false,
    });

    clickCreateTicket();
    assertValidation(texts.departmentRequired);
  });

  it("TC07 - should show validation when description is blank", () => {
    clickNewTicket();

    fillMandatoryFields({
      description: null,
    });

    clickCreateTicket();
    assertValidation(texts.descriptionRequired);
  });

  it("TC08 - should create ticket successfully and verify it in the tickets list", () => {
    const uniqueSubject = `Automation Ticket ${Date.now()}`;

    clickNewTicket();

    cy.intercept("POST", "**/tickets**").as("createTicketRequest");

    fillMandatoryFields({
      subject: uniqueSubject,
    });

    clickCreateTicket();

    // cy.wait("@createTicketRequest", { timeout: 20000 }).then((interception) => {
    //   expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    // });

    verifyTicketCreated(uniqueSubject);
  });
});