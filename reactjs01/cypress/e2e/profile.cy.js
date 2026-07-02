describe("Profile Page Smoke Tests", () => {
  beforeEach(() => {
    cy.login("user");

    cy.intercept("GET", "**/api/auth/user", {
      statusCode: 200,
      body: {
        message: "Welcome user",
        user: {
          _id: "123",
          email: "user@example.com",
          role: "user",
          fullName: "Mock User",
          avatar: "mock-avatar-path.png",
        },
      },
    }).as("getUser");

    cy.intercept("GET", "**/api/workspaces", {
      statusCode: 200,
      body: {
        errCode: 0,
        message: "Workspaces fetched successfully",
        data: [
          {
            _id: "6a2e999a3c0cbd9d2589efb4",
            id: "6a2e999a3c0cbd9d2589efb4",
            name: "Mock Workspace 1",
            memberRole: "OWNER",
          },
        ],
      },
    }).as("getWorkspaces");

    cy.visit("/user/profile");
  });

  it("should render profile fields and avatar correctly", () => {
    cy.get("legend").contains("Profile").should("be.visible");

    cy.get("form").should("exist");

    cy.get("label").contains("Email").should("be.visible");
    cy.get("input[id='email']").should("exist").and("be.disabled");

    cy.get("label").contains("Role").should("be.visible");
    cy.get("input[id='role']").should("exist").and("be.disabled");

    cy.get("label").contains("Full Name").should("be.visible");
    cy.get("input[id='fullName']").should("exist").and("be.visible");

    cy.get("label").contains("Avatar").should("be.visible");
    cy.get(".ant-upload").should("exist");

    cy.get("button[type='button']").contains("Update Profile").should("be.visible");

    cy.get("a").contains("Back").should("be.visible");
  });
});
