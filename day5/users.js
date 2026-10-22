const loadUsersBtn = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusEl = document.getElementById("status");
const usersList = document.getElementById("users-list");

let loadedUsers = [];

function renderUsers(list) {
    usersList.innerHTML = "";

    if (list.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No users match your filter.";
        usersList.appendChild(li);
        return;
    }

    for (const user of list) {
        const li = document.createElement("li");

        const nameEl = document.createElement("h3");
        nameEl.textContent = user.name;

        const emailEl = document.createElement("p");
        emailEl.textContent = `Email: ${user.email}`;

        const cityEl = document.createElement("p");
        const city = user.address && user.address.city ? user.address.city : (user.city || "");
        cityEl.textContent = `City: ${city}`;

        const companyEl = document.createElement("p");
        const company = user.company && user.company.name ? user.company.name : (user.company || "");
        companyEl.textContent = `Company: ${company}`;

        li.appendChild(nameEl);
        li.appendChild(emailEl);
        li.appendChild(cityEl);
        li.appendChild(companyEl);

        usersList.appendChild(li);
    }
}

async function loadUsers() {
    loadUsersBtn.disabled = true;
    statusEl.textContent = "Loading users...";
    usersList.innerHTML = "";
    filterInput.value = "";

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        loadedUsers = await response.json();
        statusEl.textContent = `Successfully loaded ${loadedUsers.length} users.`;
        renderUsers(loadedUsers);
    } catch (error) {
        statusEl.textContent = `Error loading users: ${error.message}`;
    } finally {
        loadUsersBtn.disabled = false;
    }
}

filterInput.addEventListener("input", () => {
    const query = filterInput.value.trim().toLowerCase();
    const filtered = loadedUsers.filter((user) =>
        user.name.toLowerCase().includes(query)
    );
    renderUsers(filtered);
});

loadUsersBtn.addEventListener("click", loadUsers);
