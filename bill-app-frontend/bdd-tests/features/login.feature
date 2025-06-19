Feature: Login

  Scenario: User logs in with valid credentials
    Given I open the login page
    When I enter "user@example.com" and "password123"
    And I click the login button
    Then I should see the dashboard
