// cypress/e2e/categories.cy.js

describe("Quess Support - Categories Module", () => {
  const loginSelectors = {
    emailInput: "#email",
    passwordInput: "#password",
    signInButton: "button",
  };

  const selectors = {
    pageTitle: "h1",
    createCategoryButton: "button",

    categoryNameInput: "#cat-name",
    categorySlugInput: "#cat-slug",
    categoryDescriptionInput: "#cat-description",
    categorySortOrderInput: "#cat-sort-order",

    tableRows: "table tbody tr",
  };

  const texts = {
    signInButton: "Sign in",
    pageTitle: "Categories",
    createCategoryButton: "Create Category",
    createButton: "Create",
  };

  const data = {
    validEmail: Cypress.env("LOGIN_EMAIL") || "agent@mailinator.com",
    validPassword: Cypress.env("LOGIN_PASSWORD") || "Agent@123",
  };

  beforeEach(() => {
    cy.visit("/login");

    cy.get(loginSelectors.emailInput)
      .should("be.visible")
      .clear()
      .type(data.validEmail);

    cy.get(loginSelectors.passwordInput)
      .should("be.visible")
      .clear()
      .type(data.validPassword);

    cy.contains(loginSelectors.signInButton, texts.signInButton)
      .should("be.visible")
      .click();

    cy.url({ timeout: 15000 }).should("not.include", "/login");

    cy.visit("/admin/categories");
    cy.contains(selectors.pageTitle, texts.pageTitle, { timeout: 15000 }).should("be.visible");
  });

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
    const name = `Automation Category ${unique}`;

    return {
      name,
      slug: slugify(name),
      description: `Created ${unique}`,
      sortOrder: "0",
    };
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