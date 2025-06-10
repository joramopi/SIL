// js/initCleanup.js
// Remove duplicate notification containers on page load
// Some pages accidentally render multiple #notificationContainer elements.
// We keep the first one and remove the rest to avoid duplicated notifications.
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('#notificationContainer');
    if (containers.length > 1) {
        containers.forEach((el, idx) => {
            if (idx > 0) el.remove();
        });
    }
});
