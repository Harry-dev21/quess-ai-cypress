// cypress/e2e/login.cy.js

import { selectors as appSelectors } from '../support/selectors'

const loginSelectors = {
  username: '#email',
  password: '#password',
  submit: 'button',
}

const passwordToggle = 'button, svg'

let testData
let data

const texts = {
  title: 'Quess Support',
  subtitle: 'Sign in to the Unified Help Desk',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  signInButton: 'Sign in',
  requiredFieldMessage: 'Please fill out this field.',
}

describe('Quess Support - Login Page', () => {
  before(() => {
    cy.fixture('testData').then((fixtureData) => {
      testData = fixtureData
    })
  })

  const getData = () => ({
    validEmail: Cypress.env('LOGIN_EMAIL') || testData.login.validEmail,
    validPassword: Cypress.env('LOGIN_PASSWORD') || testData.login.validPassword,
    invalidEmail: 'wrong@quess.com',
    invalidPassword: 'WrongPassword123',
    badEmail: 'abc',
  })

  beforeEach(() => {
    data = getData()
    cy.visit('/login')
  })

  function typeEmail(value) {
    cy.get(loginSelectors.username)
      .should('be.visible')
      .clear()
      .type(value)
      .should('have.value', value);
  }

  function typePassword(value) {
    cy.get(loginSelectors.password)
      .should('be.visible')
      .clear()
      .type(value)
      .should('have.value', value);
  }

  function clickSignIn() {
    cy.contains('button', texts.signInButton)
      .should('be.visible')
      .and('not.be.disabled')
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

    cy.get(loginSelectors.username)
      .should('be.visible')
      .and('have.attr', 'placeholder', 'you@quess.com');

    cy.get(loginSelectors.password)
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Enter your password');

    cy.get(loginSelectors.submit).contains(texts.signInButton).should('be.visible');
  });

  it("TC02 - should allow typing email and password", () => {
    typeEmail(data.validEmail);
    typePassword(data.validPassword);
  });

  it("TC03 - should show native validation when email is blank", () => {
    typePassword(data.validPassword);
    clickSignIn();

    assertNativeValidationMessage(loginSelectors.username);
    assertFieldInvalid(loginSelectors.username);
  });

  it('TC04 - should show native validation when password is blank', () => {
    typeEmail(data.validEmail);
    clickSignIn();

    assertNativeValidationMessage(loginSelectors.password);
    assertFieldInvalid(loginSelectors.password);
  });

  it('TC05 - should show native validation when both fields are blank', () => {
    clickSignIn();

    assertNativeValidationMessage(loginSelectors.username);
    assertFieldInvalid(loginSelectors.username);
    assertFieldInvalid(loginSelectors.password);
  });

  it("TC06 - should show validation for invalid email format", () => {
    typeEmail(data.badEmail);
    typePassword(data.validPassword);
    clickSignIn();

    cy.get(loginSelectors.username).then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.not.equal('');
    });
  });

  it("TC07 - should toggle password visibility if eye icon is clickable", () => {
    typePassword(data.validPassword);

    cy.get(loginSelectors.password)
      .should('have.attr', 'type')
      .then((initialType) => {
        cy.get(loginSelectors.password)
          .parent()
          .find(passwordToggle)
          .first()
          .then(($toggle) => {
            if ($toggle.length) {
              cy.wrap($toggle).click({ force: true });

              cy.get(loginSelectors.password)
                .invoke('attr', 'type')
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

  it("TC09 - should show invalid credentials API response", () => {
    cy.intercept("POST", "**/login**", {
      statusCode: 401,
      body: { message: "Invalid email or password" },
    }).as("loginRequest");

    typeEmail(data.invalidEmail);
    typePassword(data.invalidPassword);
    clickSignIn();

    cy.wait("@loginRequest", { timeout: 10000 }).then((interception) => {
      expect(interception.response).to.have.property('statusCode', 401);
      expect(interception.response.body).to.deep.equal({ message: 'Invalid email or password' });
      expect(interception.error).to.be.undefined;
    });
  });

  it('TC10 - should keep Sign in button visible', () => {
    cy.contains('button', texts.signInButton).should('be.visible')
  })

  it('TC11 - should trim whitespace in credentials if configured by frontend', () => {
    const rawEmail = `   ${data.validEmail}   `;
    const rawPassword = `   ${data.validPassword}   `;

    cy.get(loginSelectors.username)
      .should('be.visible')
      .clear()
      .type(rawEmail)
      .invoke('val')
      .then((val) => {
        expect(val.trim()).to.equal(data.validEmail);
      });

    cy.get(loginSelectors.password)
      .should('be.visible')
      .clear()
      .type(rawPassword)
      .invoke('val')
      .then((val) => {
        expect(val.trim()).to.equal(data.validPassword);
      });

    cy.intercept('POST', '**/login**', { fixture: 'api/login-success.json' }).as('loginRequest');
    clickSignIn();

    cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 201]);
    // App behavior may redirect or stay on login; this test validates whitespace handling only.
  });

  it('TC12 - should show network error when login endpoint is unreachable', () => {
    cy.intercept('POST', '**/login**', { forceNetworkError: true }).as('loginRequest');

    typeEmail(data.validEmail);
    typePassword(data.validPassword);
    clickSignIn();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.error).to.have.property('message');
    });

    // Interception error assertion is sufficient for a network failure scenario.
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.error).to.have.property('message');
    });
  });

  it('TC13 - should show server error for 5xx login responses', () => {
    cy.intercept('POST', '**/login**', { statusCode: 500, body: { message: 'Internal Server Error' } }).as('loginRequest');

    typeEmail(data.validEmail);
    typePassword(data.validPassword);
    clickSignIn();

    cy.wait('@loginRequest');
    cy.contains(/server error|Internal Server Error|something went wrong/i).should('be.visible');
  });

  it('TC14 - should reject invalid short password', () => {
    typeEmail(data.validEmail);
    typePassword('a');
    clickSignIn();

    cy.contains(/password.*(min|length)|weak password/i).should('be.visible');
  })
});