// cypress/e2e/add-ticket.cy.js

describe("Quess Support - Add Ticket", () => {
  const loginSelectors = {
    emailInput: "#email",
    passwordInput: "#password",
    signInButton: "button",
  };

  const selectors = {
    pageTitle: "h1",
    newTicketButton: ".sticky > .group\\/button",

    subjectInput: "#subject",
    descriptionEditor: ".tiptap",
    associateEmailInput: "#associateEmail",
    categoryDropdown: "#categoryId",
    departmentDropdown: "#departmentId",

    createTicketButton: "button",
    ticketSearchInput: ".flex-wrap > .relative > .min-w-0",
    ticketRows: ".space-y-6 > :nth-child(2)",
  };

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
    validEmail: Cypress.env("LOGIN_EMAIL") || "agent@mailinator.com",
    validPassword: Cypress.env("LOGIN_PASSWORD") || "Agent@123",

    associateEmail: "qa.ticket@quess.com",
    invalidAssociateEmail: "abc",
    description: "This ticket was created by Cypress automation.",
    priority: "Medium",
    queryType: "Payroll", // update if needed
  };

  beforeEach(() => {
    cy.visit("/login");

    cy.get(loginSelectors.emailInput)
      .should("be.visible")
      .clear()
      .type(data.validEmail)
      .should("have.value", data.validEmail);

    cy.get(loginSelectors.passwordInput)
      .should("be.visible")
      .clear()
      .type(data.validPassword)
      .should("have.value", data.validPassword);

    cy.contains(loginSelectors.signInButton, texts.signInButton)
      .should("be.visible")
      .and("not.be.disabled")
      .click();

    cy.url({ timeout: 15000 }).should("not.include", "/login");
    cy.visit("/tickets");
    cy.contains(selectors.pageTitle, texts.ticketsPage, { timeout: 15000 }).should("be.visible");
  });

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