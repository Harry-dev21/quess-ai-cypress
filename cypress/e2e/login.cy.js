// cypress/e2e/login.cy.js

describe("Quess Support - Login Page", () => {
  const selectors = {
    emailInput: '#email',
    passwordInput: '#password',
    signInButton: 'button',
    passwordToggle: 'button, svg',
  };

  const texts = {
    title: 'Quess Support',
    subtitle: 'Sign in to the Unified Help Desk',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signInButton: 'Sign in',
    requiredFieldMessage: 'Please fill out this field.',
  };

  const data = {
    validEmail: Cypress.env("LOGIN_EMAIL") || "agent@mailinator.com",
    validPassword: Cypress.env("LOGIN_PASSWORD") || "Agent@123",
    invalidEmail: "wrong@quess.com",
    invalidPassword: "WrongPassword123",
    badEmail: "abc",
  };

  beforeEach(() => {
    cy.visit("/login"); // update if your route is different
  });

  function typeEmail(value) {
    cy.get(selectors.emailInput)
      .should("be.visible")
      .clear()
      .type(value)
      .should("have.value", value);
  }

  function typePassword(value) {
    cy.get(selectors.passwordInput)
      .should("be.visible")
      .clear()
      .type(value)
      .should("have.value", value);
  }

  function clickSignIn() {
    cy.contains(selectors.signInButton, texts.signInButton)
      .should("be.visible")
      .and("not.be.disabled")
      .click();
  }

  function assertNativeValidationMessage(selector, expectedMessage = texts.requiredFieldMessage) {
    cy.get(selector).then(($input) => {
      expect($input[0].validationMessage).to.eq(expectedMessage);
    });
  }

  function assertFieldInvalid(selector) {
    cy.get(selector).then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
    });
  }

  it("TC01 - should display login page UI correctly", () => {
    cy.contains(texts.title).should("be.visible");
    cy.contains(texts.subtitle).should("be.visible");
    cy.contains(texts.emailLabel).should("be.visible");
    cy.contains(texts.passwordLabel).should("be.visible");

    cy.get(selectors.emailInput)
      .should("be.visible")
      .and("have.attr", "placeholder", "you@quess.com");

    cy.get(selectors.passwordInput)
      .should("be.visible")
      .and("have.attr", "placeholder", "Enter your password");

    cy.contains(selectors.signInButton, texts.signInButton).should("be.visible");
  });

  it("TC02 - should allow typing email and password", () => {
    typeEmail(data.validEmail);
    typePassword(data.validPassword);
  });

  it("TC03 - should show native validation when email is blank", () => {
    typePassword(data.validPassword);
    clickSignIn();

    assertNativeValidationMessage(selectors.emailInput);
    assertFieldInvalid(selectors.emailInput);
  });

  it("TC04 - should show native validation when password is blank", () => {
    typeEmail(data.validEmail);
    clickSignIn();

    assertNativeValidationMessage(selectors.passwordInput);
    assertFieldInvalid(selectors.passwordInput);
  });

  it("TC05 - should show native validation when both fields are blank", () => {
    clickSignIn();

    assertNativeValidationMessage(selectors.emailInput);
    assertFieldInvalid(selectors.emailInput);
    assertFieldInvalid(selectors.passwordInput);
  });

  it("TC06 - should show validation for invalid email format", () => {
    typeEmail(data.badEmail);
    typePassword(data.validPassword);
    clickSignIn();

    cy.get(selectors.emailInput).then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.not.equal('');
    });
  });

  it("TC07 - should toggle password visibility if eye icon is clickable", () => {
    typePassword(data.validPassword);

    cy.get(selectors.passwordInput)
      .should("have.attr", "type")
      .then((initialType) => {
        cy.get(selectors.passwordInput)
          .parent()
          .find(selectors.passwordToggle)
          .first()
          .then(($toggle) => {
            if ($toggle.length) {
              cy.wrap($toggle).click({ force: true });

              cy.get(selectors.passwordInput)
                .invoke("attr", "type")
                .should((newType) => {
                  expect(newType).to.not.equal(initialType);
                });
            }
          });
      });
  });

  it("TC08 - should login successfully with valid credentials", () => {
    cy.intercept("POST", "**/login**").as("loginRequest"); // update endpoint if needed

    typeEmail(data.validEmail);
    typePassword(data.validPassword);
    clickSignIn();

    cy.wait("@loginRequest", { timeout: 10000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });

    cy.url().should("not.include", "/login");
  });

  it("TC09 - should show error for invalid credentials", () => {
    cy.intercept("POST", "**/login**").as("loginRequest"); // update endpoint if needed

    typeEmail(data.invalidEmail);
    typePassword(data.invalidPassword);
    clickSignIn();

    cy.wait("@loginRequest", { timeout: 10000 });

    cy.contains(/invalid credentials|Invalid email or password|login failed/i).should("be.visible");
  });

  it("TC10 - should keep Sign in button visible", () => {
    cy.contains(selectors.signInButton, texts.signInButton).should("be.visible");
  });
});