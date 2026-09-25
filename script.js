document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.getElementById("search-btn");
    const inputfield = document.getElementById("userProfileName");
    const searchForm = document.querySelector(".searchInput form");
    const searchPlace = document.querySelector(".searchInput");

    function validateUsername(userName) {
        const regex = /^(?=.{3,30}$)[A-Za-z0-9]+(?:[-][A-Za-z0-9]+)*$/;
        return regex.test(userName);
    }

    function showError(message) {
        const existing = searchPlace.querySelector(".search-error");
        if (existing) existing.remove();

        const userNotfound = document.createElement("p");
        userNotfound.className = "search-error";
        userNotfound.textContent = message;
        searchPlace.insertAdjacentElement("beforeend", userNotfound);

        setTimeout(() => userNotfound.remove(), 2000);
    }

    async function fetchUserdetail(username) {
        const url = `https://leetcode-api-pied.vercel.app/user/${username}`;

        try {
            searchBtn.textContent = "Searching...";
            searchBtn.disabled = true;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok || data.detail === "User not found") {
                throw new Error("Incorrect");
            }

            sessionStorage.setItem("leetcodeData", JSON.stringify(data));
            window.location.href = "index3.html";
        } catch (err) {
            showError("User not found");
        } finally {
            searchBtn.textContent = "Search";
            searchBtn.disabled = false;
        }
    }

    function handleSearch() {
        const userData = inputfield.value.trim();

        if (!validateUsername(userData)) {
            showError("Enter a valid username");
            return;
        }

        fetchUserdetail(userData);
    }

    // Submitting the form (Enter key or clicking the submit button)
    // triggers this once — no separate click listener needed, which
    // would otherwise fire the search twice.
    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleSearch();
        });
    } else {
        searchBtn.addEventListener("click", function (e) {
            e.preventDefault();
            handleSearch();
        });
    }
});

// ===========================
// Theme toggle (light / dark)
// ===========================
const btn_theme = document.querySelector('#light_dakrmode');
const moon = document.querySelector('#moon');
const sun = document.querySelector('#sun');
const fullbodymain = document.querySelector(".mainFullbody");

// Restore saved theme on load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    fullbodymain.classList.add("light");
    sun.classList.remove("removeDisplay");
    moon.classList.add("removeDisplay");
}

btn_theme.addEventListener('click', () => {
    const isLight = fullbodymain.classList.toggle('light');

    if (isLight) {
        sun.classList.remove('removeDisplay');
        moon.classList.add('removeDisplay');
        localStorage.setItem("theme", "light");
    } else {
        moon.classList.remove('removeDisplay');
        sun.classList.add('removeDisplay');
        localStorage.setItem("theme", "dark");
    }
});