describe("Dashboard & Layout Smoke Tests", () => {
  beforeEach(() => {
    cy.login("user");

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

    cy.intercept("GET", "**/api/projects*", {
      statusCode: 200,
      body: {
        errCode: 0,
        message: "Projects fetched successfully",
        data: [
          {
            _id: "p1",
            id: "p1",
            title: "Mock Project Alpha",
            description: "This is a test project",
            status: "IDEA",
            tags: ["Test", "React"],
            createdAt: "2026-06-30T10:00:00Z",
          },
        ],
      },
    }).as("getProjects");

    cy.intercept("GET", "**/api/notifications*", {
      statusCode: 200,
      body: {
        errCode: 0,
        message: "Notifications fetched successfully",
        data: [],
        pagination: { unreadCount: 0 },
      },
    }).as("getNotifications");

    cy.visit("/workspace/dashboard");
  });

  it("should render sidebar navigation correctly", () => {
    cy.get("aside").should("exist").and("be.visible");

    cy.get("aside").contains("CreatorSpace").should("be.visible");
    cy.get("aside").contains("STUDIO").should("be.visible");

    cy.get("aside").contains("Dashboard").should("be.visible");
    cy.get("aside").contains("Project").should("be.visible");
    cy.get("aside").contains("Relationship diagram").should("be.visible");
    cy.get("aside").contains("Assets").should("be.visible");
    cy.get("aside").contains("Settings").should("be.visible");

    cy.get("aside").contains("Đăng xuất").should("be.visible");

    cy.get("aside").contains("Mock User").should("be.visible");
  });


  it("should render Kanban Board Columns on the dashboard page", () => {
    cy.get("div").contains("Ý TƯỞNG").should("be.visible");
    cy.get("div").contains("ĐANG VIẾT").should("be.visible");
    cy.get("div").contains("LÀM MEDIA").should("be.visible");
    cy.get("div").contains("ĐÃ ĐĂNG").should("be.visible");

  });
});
