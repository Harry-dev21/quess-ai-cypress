// cypress/e2e/categories.cy.js

import { selectors as appSelectors } from '../support/selectors'

describe('Quess Support - Categories Module', () => {
  const selectors = appSelectors.categories

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

    cy.visit('/admin/categories')
    cy.contains(selectors.pageTitle, 'Categories', { timeout: 15000 }).should('be.visible')
  })

  const texts = {
    signInButton: 'Sign in',
    pageTitle: 'Categories',
    createCategoryButton: 'Create Category',
    createButton: 'Create',
  }


  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function createCategoryData() {
    const unique = Date.now();
    const name = `${testData.categories.categoryPrefix} ${unique}`;

    return {
      name,
      slug: slugify(name),
      description: `${testData.categories.categoryDescriptionPrefix} ${unique}`,
      sortOrder: testData.categories.defaultSortOrder,
    }
  }

  function openCreateCategoryModal() {
    cy.contains(selectors.createCategoryButton, texts.createCategoryButton)
      .should("be.visible")
      .click();

    cy.contains('[role="dialog"] h2, [role="dialog"]', texts.createCategoryButton, {
      timeout: 10000,
    }).should("be.visible");
  }

  function getCreateCategoryDialog() {
    return cy
      .contains('[role="dialog"] h2, [role="dialog"]', texts.createCategoryButton, {
        timeout: 10000,
      })
      .closest('[role="dialog"]');
  }

  function fillForm(formData = {}) {
    if (formData.name !== null && formData.name !== undefined) {
      cy.get(selectors.categoryNameInput)
        .should("be.visible")
        .clear()
        .type(formData.name);
    }

    if (formData.slug !== null && formData.slug !== undefined) {
      cy.get(selectors.categorySlugInput)
        .should("be.visible")
        .clear()
        .type(formData.slug);
    }

    if (formData.description !== null && formData.description !== undefined) {
      cy.get(selectors.categoryDescriptionInput)
        .should("be.visible")
        .clear()
        .type(formData.description);
    }

    if (formData.sortOrder !== null && formData.sortOrder !== undefined) {
      cy.get(selectors.categorySortOrderInput)
        .should("be.visible")
        .clear()
        .type(formData.sortOrder);
    }
  }

  function verifyCategoryExists(name) {
    cy.contains(selectors.tableRows + ", body", name, { timeout: 15000 }).should("be.visible");
  }

  it("TC01 - should load Categories page", () => {
    cy.contains(texts.pageTitle).should("be.visible");
    cy.contains("Create Category").should("be.visible");
  });

  it("TC02 - should open Create Category modal", () => {
    openCreateCategoryModal();
  });

  it("TC03 - should keep Create button disabled when name is missing", () => {
    openCreateCategoryModal();

    fillForm({
      name: null,
      slug: `cat-${Date.now()}`,
      description: "test",
      sortOrder: "0",
    });

    getCreateCategoryDialog().within(() => {
      cy.contains("button", /^Create$/, { timeout: 10000 })
        .should("exist")
        .and("be.disabled");
    });
  });

  it("TC04 - should keep Create button disabled when slug is blank", () => {
    openCreateCategoryModal();

    const name = `Category ${Date.now()}`;

    cy.get(selectors.categoryNameInput)
      .should("be.visible")
      .clear()
      .type(name);

    cy.get(selectors.categorySlugInput)
      .should("be.visible")
      .clear()
      .blur()
      .should("have.value", "");

    cy.get(selectors.categoryDescriptionInput)
      .should("be.visible")
      .clear()
      .type("test");

    cy.get(selectors.categorySortOrderInput)
      .should("be.visible")
      .clear()
      .type("0");

    getCreateCategoryDialog().within(() => {
      cy.contains("button", /^Create$/, { timeout: 10000 })
        .should("exist")
        .and("be.disabled");
    });
  });

  it("TC05 - should enable Create button when all fields are filled", () => {
    openCreateCategoryModal();

    const category = createCategoryData();
    fillForm(category);

    getCreateCategoryDialog().within(() => {
      cy.contains("button", /^Create$/, { timeout: 10000 })
        .should("exist")
        .and("not.be.disabled");
    });
  });

  it("TC06 - should create category successfully", () => {
    const category = createCategoryData();

    cy.intercept("POST", "**/categories**").as("createCategory");

    openCreateCategoryModal();
    fillForm(category);

    getCreateCategoryDialog().within(() => {
      cy.contains("button", /^Create$/, { timeout: 10000 })
        .should("exist")
        .and("not.be.disabled")
        .click();
    });

    cy.wait("@createCategory")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);

    verifyCategoryExists(category.name);
  });
});