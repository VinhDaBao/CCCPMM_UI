Cypress.Commands.add("login", (role = "user") => {
  const payload = {
    role: role,
    id: "123",
    email: `${role}@example.com`,
    name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`
  };
  
  const tokenPayload = btoa(JSON.stringify(payload));
  const mockToken = `header.${tokenPayload}.signature`;
  
  localStorage.setItem("access_token", mockToken);
  localStorage.setItem("refresh_token", "mock-refresh-token");

  cy.intercept("GET", "**/api/auth/user/profile", {
    statusCode: 200,
    body: {
      message: "Welcome user",
      user: {
        _id: "123",
        email: "user@example.com",
        role: "user",
        fullName: "Mock User",
        avatar: "mock-avatar-path.png"
      }
    }
  }).as("getUserProfile");

  cy.intercept("GET", "**/api/auth/admin/profile", {
    statusCode: 200,
    body: {
      message: "Welcome admin",
      user: {
        _id: "456",
        email: "admin@example.com",
        role: "admin",
        fullName: "Mock Admin",
        avatar: "mock-avatar-path.png"
      }
    }
  }).as("getAdminProfile");
});
