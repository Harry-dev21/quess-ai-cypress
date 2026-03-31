export const selectors = {
  login: {
    username: '#email',
    password: '#password',
    submit: 'button',
    error: '[data-testid="login-error"]'
  },
  
  categories: {
    pageTitle: 'h1',
    createCategoryButton: 'button',
    categoryNameInput: '#cat-name',
    categorySlugInput: '#cat-slug',
    categoryDescriptionInput: '#cat-description',
    categorySortOrderInput: '#cat-sort-order',
    tableRows: 'table tbody tr'
  },
  tickets: {
    pageTitle: 'h1',
    newTicketButton: '.sticky > .group\/button',
    subjectInput: '#subject',
    descriptionEditor: '.tiptap',
    associateEmailInput: '#associateEmail',
    categoryDropdown: '#categoryId',
    departmentDropdown: '#departmentId',
    createTicketButton: 'button',
    ticketSearchInput: '.flex-wrap > .relative > .min-w-0',
    ticketRows: '.space-y-6 > :nth-child(2)'
  }
}