describe("Asset Library Page Smoke Tests", () => {
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

    cy.intercept("GET", "**/api/auth/billing-info*", {
      statusCode: 200,
      body: {
        errCode: 0,
        data: {
          plan: {
            name: "FREE PLAN",
            storageLimitMB: 500,
            workspaceLimit: 3,
          },
          storage: {
            totalUsedBytes: 10485760,
            audioVideoBytes: 5242880,
            imageBytes: 5242880,
            limitBytes: 524288000,
          },
          payments: [],
        },
      },
    }).as("getBillingInfo");

    cy.intercept("GET", "**/api/assets*", {
      statusCode: 200,
      body: {
        errCode: 0,
        message: "Lấy danh sách tài nguyên thành công!",
        total: 2,
        data: [
          {
            _id: "asset-1",
            id: "asset-1",
            fileName: "MockAudioFile.mp3",
            type: "audio",
            url: "mock-audio-url.mp3",
            tags: ["ambient", "bgm"],
            createdAt: "2026-06-30T10:00:00Z",
          },
          {
            _id: "asset-2",
            id: "asset-2",
            fileName: "MockImageFile.png",
            type: "image",
            url: "mock-image-url.png",
            tags: ["character", "visual"],
            createdAt: "2026-06-30T10:10:00Z",
          },
        ],
      },
    }).as("getAssets");

    cy.intercept("GET", "**/api/assets/tags*", {
      statusCode: 200,
      body: {
        errCode: 0,
        data: ["ambient", "bgm", "character", "visual"],
      },
    }).as("getTags");

    cy.visit("/workspace/assets");
  });

  it("should render Asset Library Page elements correctly", () => {
    cy.get("div").contains("Kho Tài Nguyên").should("be.visible");

    cy.get("button").contains("Tất cả").should("be.visible");
    cy.get("button").contains("Hình ảnh").should("be.visible");
    cy.get("button").contains("Âm thanh").should("be.visible");

    cy.get("input[placeholder='Tìm tên file hoặc #tag...']").should("exist").and("be.visible");

    cy.get(".ant-select").should("exist").and("be.visible");

    cy.get("div").contains("Dung lượng:").should("be.visible");
    cy.get(".ant-progress").should("exist").and("be.visible");

    cy.get("button").contains("Upload Media").should("be.visible");

    cy.get("div").contains("MockAudioFile.mp3").should("be.visible");
    cy.get("div").contains("MockImageFile.png").should("be.visible");
    cy.get("span").contains("#ambient").should("be.visible");
    cy.get("span").contains("#character").should("be.visible");
  });
});
