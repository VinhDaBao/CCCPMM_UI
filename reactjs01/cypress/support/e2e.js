import "./commands";

Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

afterEach(function () {
  cy.screenshot(this.currentTest.title, {
    capture: "viewport",
  });
});