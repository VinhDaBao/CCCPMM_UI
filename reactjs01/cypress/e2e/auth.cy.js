describe("Authentication Pages Smoke Tests", () => {
  beforeEach(() => {
    cy.intercept("POST", "**/api/auth/**", { statusCode: 200, body: {} });
  });

  it("should render Login page elements correctly", () => {
    cy.visit("/login");

    cy.get("h1").contains("CreatorSpace").should("be.visible");
    cy.get("p").contains("Login to your account").should("be.visible");

    cy.get("form").should("exist");

    cy.get("label").contains("Email").should("be.visible");
    cy.get("input[id='basic_email']").should("exist").and("be.visible");

    cy.get("label").contains("Password").should("be.visible");
    cy.get("input[id='basic_password']").should("exist").and("be.visible");

    cy.get("a").contains("Forgot Password?").should("be.visible");
    cy.get("a").contains("Create Account").should("be.visible");

    cy.get("button[type='submit']").contains("Login").should("be.visible");
  });

  it("should render Register page elements correctly", () => {
    cy.visit("/register");

    cy.get("h1").contains("Register").should("be.visible");

    cy.get("form").should("exist");

    cy.get("label").contains("Full Name").should("be.visible");
    cy.get("input[id='name']").should("exist").and("be.visible");

    cy.get("label").contains("Email").should("be.visible");
    cy.get("input[id='email']").should("exist").and("be.visible");

    cy.get("label").contains("Password").should("be.visible");
    cy.get("input[id='password']").should("exist").and("be.visible");

    cy.get("button[type='submit']").contains("Create Account").should("be.visible");

    cy.get("a").contains("Login").should("be.visible");
    cy.get("a").contains("Back to Home").should("be.visible");
  });

  it("should render Forgot Password page elements correctly", () => {
    cy.visit("/forgot-password");

    cy.get("h1").contains("Forgot Password").should("be.visible");
    cy.get("p").contains("Enter your email to receive an OTP").should("be.visible");

    cy.get("form").should("exist");

    cy.get("label").contains("Email").should("be.visible");
    cy.get("input[id='email']").should("exist").and("be.visible");

    cy.get("button[type='submit']").contains("Send OTP").should("be.visible");

    cy.get("a").contains("Back to Login").should("be.visible");
  });

  it("should render Verify OTP page elements correctly", () => {
    cy.window().then((win) => {
      win.sessionStorage.setItem("reset_email", "test@example.com");
    });
    
    cy.visit("/verify-otp");

    cy.get("h1").should("exist");
    
    cy.get("form").should("exist");

    cy.get("input").should("exist").and("be.visible");

    cy.get("button[type='submit']").should("exist").and("be.visible");
  });

  it("should render Reset Password page elements correctly", () => {
    cy.window().then((win) => {
      win.sessionStorage.setItem("reset_email", "test@example.com");
    });

    cy.visit("/reset-password");

    cy.get("h1").contains("Reset Password").should("be.visible");

    cy.get("form").should("exist");

    cy.get("label").contains("New Password").should("be.visible");
    cy.get("input[id='password']").should("exist").and("be.visible");

    cy.get("label").contains("Confirm Password").should("be.visible");
    cy.get("input[id='confirmPassword']").should("exist").and("be.visible");

    cy.get("button[type='submit']").contains("Reset Password").should("be.visible");
  });
});
