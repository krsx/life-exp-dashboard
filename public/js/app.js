/**
 * Life Expectancy Dashboard - Client-side JavaScript
 */

// Initialize HTMX event handlers
document.addEventListener("DOMContentLoaded", function () {
  console.log("Life Expectancy Dashboard initialized");

  // Auto-dismiss alerts after 5 seconds
  setupAutoAlertDismiss();
});

/**
 * Auto-dismiss Bootstrap alerts after 5 seconds
 */
function setupAutoAlertDismiss() {
  // Handle dynamically loaded alerts from HTMX
  document.body.addEventListener("htmx:afterSwap", function (event) {
    const alerts = event.detail.target.querySelectorAll(
      ".alert:not(.alert-warning):not(.alert-info)"
    );
    alerts.forEach(function (alert) {
      setTimeout(function () {
        const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
        if (bsAlert) {
          bsAlert.close();
        }
      }, 5000);
    });
  });
}

/**
 * HTMX event: Before request starts
 */
document.body.addEventListener("htmx:beforeRequest", function (event) {
  // You can add loading state handling here
});

/**
 * HTMX event: After request completes
 */
document.body.addEventListener("htmx:afterRequest", function (event) {
  // Handle any post-request logic
  if (event.detail.failed) {
    console.error("HTMX request failed:", event.detail);
  }
});

/**
 * HTMX event: Response error
 */
document.body.addEventListener("htmx:responseError", function (event) {
  console.error("HTMX response error:", event.detail);
  // Show a generic error message
  const target = event.detail.target;
  if (target) {
    target.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        An error occurred while processing your request. Please try again.
      </div>
    `;
  }
});

/**
 * Handle year dropdown update for country selection
 * Used in the update form
 */
document.body.addEventListener("change", function (event) {
  if (event.target.id === "country_code") {
    const countryCode = event.target.value;
    const yearSelect = document.getElementById("year");

    if (yearSelect && countryCode) {
      // Clear current value display if exists
      const currentValueDiv = document.getElementById("current-value");
      if (currentValueDiv) {
        currentValueDiv.innerHTML = "";
      }

      // Trigger HTMX to fetch years
      htmx.ajax("GET", "/api/years-options/" + countryCode, {
        target: "#year",
      });
    }
  }
});

/**
 * Handle year selection to show current value
 * Used in the update form
 */
document.body.addEventListener("change", function (event) {
  if (event.target.id === "year") {
    const year = event.target.value;
    const countrySelect = document.getElementById("country_code");
    const currentValueDiv = document.getElementById("current-value");

    if (countrySelect && currentValueDiv && year && countrySelect.value) {
      htmx.ajax("GET", "/api/value/" + countrySelect.value + "/" + year, {
        target: "#current-value",
      });
    }
  }
});

/**
 * Form validation helper
 */
function validateYearRange(startYear, endYear) {
  const start = parseInt(startYear);
  const end = parseInt(endYear);

  if (isNaN(start) || isNaN(end)) {
    return false;
  }

  return start <= end;
}

/**
 * Confirm before delete
 * This is handled by hx-confirm, but we can add additional logic if needed
 */
document.body.addEventListener("htmx:confirm", function (event) {
  // Additional confirmation logic can go here
});
