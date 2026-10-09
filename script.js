// ---------- 1. DATA ----------
// This array holds all the equipment. Each item is an object.
var equipment = [];

var defaultEquipment = [
  { id: 1, name: "Dell Desktop",     category: "Computer", status: "Working",           date: "2026-12-01" },
  { id: 2, name: "HP Laptop",        category: "Computer", status: "Faulty",            date: "2026-09-15" },
  { id: 3, name: "Epson Printer",    category: "Printer",  status: "Under Maintenance", date: "2026-10-20" },
  { id: 4, name: "TP-Link Router",   category: "Network",  status: "Working",           date: "2027-01-10" },
  { id: 5, name: "Network Switch",   category: "Network",  status: "Working",           date: "2026-11-05" },
  { id: 6, name: "Projector",        category: "Other",    status: "Working",           date: "2026-12-20" }
];

// ---------- 2. SAVING AND LOADING (localStorage) ----------
function saveData() {
  // localStorage can only store text, so we convert the array to text first
  localStorage.setItem("equipment", JSON.stringify(equipment));
}

function loadData() {
  var saved = localStorage.getItem("equipment");
  if (saved) {
    equipment = JSON.parse(saved);   // convert the text back into an array
  } else {
    equipment = defaultEquipment;    // first time: use the starting data
    saveData();
  }
}

// ---------- 3. SHOW THE EQUIPMENT ON THE PAGE ----------
function showEquipment() {
  var searchText = document.getElementById("search").value.toLowerCase();
  var categoryChoice = document.getElementById("categoryFilter").value;
  var statusChoice = document.getElementById("statusFilter").value;

  var html = "";

  // Go through every item and only show the ones that match the filters
  for (var i = 0; i < equipment.length; i++) {
    var item = equipment[i];

    var matchesSearch = item.name.toLowerCase().includes(searchText);
    var matchesCategory = (categoryChoice === "All" || item.category === categoryChoice);
    var matchesStatus = (statusChoice === "All" || item.status === statusChoice);

    if (matchesSearch && matchesCategory && matchesStatus) {
      html = html +
        '<div class="card" onclick="showDetails(' + item.id + ')">' +
        '<h3>' + item.name + '</h3>' +
        '<p>' + item.category + '</p>' +
        '<p class="' + getStatusClass(item.status) + '">' + item.status + '</p>' +
        '<p>' + getMaintenanceText(item.date) + '</p>' +
        '</div>';
    }
  }

  if (html === "") {
    html = "<p>No equipment found.</p>";
  }

  document.getElementById("equipmentList").innerHTML = html;
  updateCounters();
}

// Returns the CSS class name that gives the status its colour
function getStatusClass(status) {
  if (status === "Working") {
    return "status-working";
  } else if (status === "Under Maintenance") {
    return "status-maintenance";
  } else {
    return "status-faulty";
  }
}

// Simple maintenance indicator: is the date already in the past?
function getMaintenanceText(dateString) {
  var today = new Date();
  var due = new Date(dateString);

  if (due < today) {
    return "Maintenance: " + dateString + " (OVERDUE)";
  } else {
    return "Maintenance: " + dateString;
  }
}

// ---------- 4. COUNTERS ----------
function updateCounters() {
  var working = 0;
  var maintenance = 0;
  var faulty = 0;

  for (var i = 0; i < equipment.length; i++) {
    if (equipment[i].status === "Working") {
      working++;
    } else if (equipment[i].status === "Under Maintenance") {
      maintenance++;
    } else if (equipment[i].status === "Faulty") {
      faulty++;
    }
  }

  document.getElementById("total").innerHTML = equipment.length;
  document.getElementById("working").innerHTML = working;
  document.getElementById("maintenance").innerHTML = maintenance;
  document.getElementById("faulty").innerHTML = faulty;
}

// ---------- 5. ADD EQUIPMENT (with validation) ----------
function addEquipment() {
  var name = document.getElementById("nameInput").value.trim();
  var category = document.getElementById("categoryInput").value;
  var status = document.getElementById("statusInput").value;
  var date = document.getElementById("dateInput").value;
  var error = document.getElementById("errorMessage");

  // Validation: check the form before saving
  if (name === "") {
    error.innerHTML = "Please enter the equipment name.";
    return;
  }
  if (name.length < 3) {
    error.innerHTML = "The name must be at least 3 characters.";
    return;
  }
  if (category === "") {
    error.innerHTML = "Please choose a category.";
    return;
  }
  if (date === "") {
    error.innerHTML = "Please choose a maintenance date.";
    return;
  }

  // Everything is fine, so create the new item
  var newItem = {
    id: Date.now(),   // a number that is different every time
    name: name,
    category: category,
    status: status,
    date: date
  };

  equipment.push(newItem);
  saveData();
  showEquipment();

  // Clear the form
  error.innerHTML = "";
  document.getElementById("nameInput").value = "";
  document.getElementById("categoryInput").value = "";
  document.getElementById("dateInput").value = "";
}

// ---------- 6. DETAILS POPUP ----------
function showDetails(id) {
  var item = findItem(id);

  document.getElementById("modalName").innerHTML = item.name;
  document.getElementById("modalCategory").innerHTML = "Category: " + item.category;
  document.getElementById("modalStatus").innerHTML = "Status: " + item.status;
  document.getElementById("modalDate").innerHTML = getMaintenanceText(item.date);

  // Fill the "change status" dropdown
  var options = ["Working", "Under Maintenance", "Faulty"];
  var select = document.getElementById("modalStatusSelect");
  select.innerHTML = "";
  for (var i = 0; i < options.length; i++) {
    var selected = "";
    if (options[i] === item.status) {
      selected = " selected";
    }
    select.innerHTML = select.innerHTML +
      "<option value='" + options[i] + "'" + selected + ">" + options[i] + "</option>";
  }

  // When the dropdown changes, update the status
  select.onchange = function () {
    changeStatus(id, select.value);
  };

  // When Remove is clicked, remove this item
  document.getElementById("removeButton").onclick = function () {
    removeEquipment(id);
  };

  // Show the popup by removing the "hidden" class
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// Find one item in the array using its id
function findItem(id) {
  for (var i = 0; i < equipment.length; i++) {
    if (equipment[i].id === id) {
      return equipment[i];
    }
  }
}

// ---------- 7. CHANGE STATUS AND REMOVE ----------
function changeStatus(id, newStatus) {
  var item = findItem(id);
  item.status = newStatus;
  saveData();
  showEquipment();
  document.getElementById("modalStatus").innerHTML = "Status: " + newStatus;
}

function removeEquipment(id) {
  var sure = confirm("Are you sure you want to remove this item?");
  if (sure) {
    var newList = [];
    for (var i = 0; i < equipment.length; i++) {
      if (equipment[i].id !== id) {
        newList.push(equipment[i]);   // keep everything except the removed one
      }
    }
    equipment = newList;
    saveData();
    showEquipment();
    closeModal();
  }
}

// ---------- 8. EVENTS (what happens when the user does something) ----------
document.getElementById("search").addEventListener("input", showEquipment);
document.getElementById("categoryFilter").addEventListener("change", showEquipment);
document.getElementById("statusFilter").addEventListener("change", showEquipment);

// ---------- 9. START THE PAGE ----------
loadData();
showEquipment();