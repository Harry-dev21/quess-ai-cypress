export const selectors = {
  login: {
    username: '[data-testid="login-username"]',
    password: '[data-testid="login-password"]',
    submit: '[data-testid="login-submit"]',
    error: '[data-testid="login-error"]'
  },
  ticket: {
    newButton: '[data-testid="new-ticket-button"]',
    subject: '[data-testid="ticket-subject"]',
    description: '[data-testid="ticket-description"]',
    associateEmail: '[data-testid="associate-email"]',
    category: '[data-testid="ticket-category"]',
    department: '[data-testid="ticket-department"]',
    priority: '[data-testid="ticket-priority"]',
    assignee: '[data-testid="ticket-assignee"]',
    save: '[data-testid="ticket-save"]',
    ticketId: '[data-testid="ticket-id"]',
    status: '[data-testid="ticket-status"]'
  },
  dashboard: {
    openCount: '[data-testid="dashboard-open-count"]',
    slaWarning: '[data-testid="dashboard-sla-warning"]',
    slaBreached: '[data-testid="dashboard-sla-breached"]'
  }
}