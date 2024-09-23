// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdn3sQrXDz9lGzmCsU7sIfazS56K4ScLI",
  authDomain: "barbershop-77353.firebaseapp.com",
  projectId: "barbershop-77353",
  storageBucket: "barbershop-77353.appspot.com",
  messagingSenderId: "1018170430611",
  appId: "1:1018170430611:web:3667f5a317d34e0e2ea966",
  measurementId: "G-4VS048B47G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Get user info from localStorage
const userId = localStorage.getItem("userId");
const userEmail = localStorage.getItem("email") || "User";

// Set greeting
const greetingElement = document.getElementById("greeting");
if (greetingElement) {
  const currentHour = new Date().getHours();
  let greetingText = "Good Evening";
  if (currentHour < 12) greetingText = "Good Morning";
  else if (currentHour < 18) greetingText = "Good Afternoon";
  greetingElement.innerText = `${greetingText}, ${userEmail}!`;
}

// Set user info in mobile menu
document.getElementById("mobile-username").innerText = userEmail;
document.getElementById("mobile-email").innerText = userEmail;

// Fetch and display business data
if (userId) {
  fetchBusinessData(userId);
} else {
  console.error("User ID not found in localStorage.");
}

async function fetchBusinessData(userId) {
  try {
    const businessesRef = collection(db, "businesses");
    const q = query(businessesRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    const businessTableBody = document.getElementById("business-table-body");
    businessTableBody.innerHTML = ""; // Clear existing data
    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const businessImage = data.image_url
        const businessBanner = data.banner_url

        const businessRow = `
          <tr>
            <td class="px-4 py-2"><img src="${businessImage}" alt="${data.business_name}" class="h-10 w-10 rounded-full"></td>
            <td class="px-4 py-2">${data.business_name}</td>
            <td class="px-4 py-2">${data.address}</td>
            <td class="px-4 py-2">${data.email}</td>
            <td class="px-4 py-2">${data.phone}</td>
            <td class="px-4 py-2">${data.business_type}</td>
            <td class="px-4 py-2">${data.working_hours}</td>
            <td class="px-4 py-2">${data.banner_url}</td>
          </tr>
        `;

        businessTableBody.innerHTML += businessRow;
      });
    } else {
      businessTableBody.innerHTML =
        '<tr><td colspan="7" class="text-center text-black">No business data found.</td></tr>';
    }
  } catch (error) {
    console.error("Error fetching business data:", error);
    document.getElementById("business-table-body").innerHTML =
      '<tr><td colspan="7" class="text-center text-red-500">Error loading business data.</td></tr>';
  }
}

// Function to escape quotes
function escapeQuotes(str) {
  if (!str) return "";
  return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Open Edit Modal
window.openEditModal = function (
  businessId,
  businessName,
  businessAddress,
  businessEmail,
  businessPhone,
  businessType,
  imageUrl,
  workingHours
) {
  // Populate form fields with existing data
  document.getElementById("businessName").value = businessName || "";
  document.getElementById("businessAddress").value = businessAddress || "";
  document.getElementById("businessEmail").value = businessEmail || "";
  document.getElementById("businessPhone").value = businessPhone || "";
  document.getElementById("businessType").value = businessType || "";
  document.getElementById("businessImage").value = ""; // Clear file input
  document.getElementById("working_hours").value = workingHours || "";

  // Show the modal
  document.getElementById("editModal").classList.remove("hidden");

  // Handle form submission
  document.getElementById("editBusinessForm").onsubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const updatedBusiness = {
      business_name: document.getElementById("businessName").value,
      address: document.getElementById("businessAddress").value,
      email: document.getElementById("businessEmail").value,
      phone: document.getElementById("businessPhone").value,
      business_type: document.getElementById("businessType").value,
      working_hours: document.getElementById("working_hours").value,
    };

    const fileInput = document.getElementById("businessImage");
    const file = fileInput.files[0]; // Get the selected file

    const progressContainer = document.getElementById("progressContainer");
    const progressBarFill = document.getElementById("progressBarFill");
    progressContainer.classList.add("hidden"); // Hide progress by default
    progressBarFill.style.width = "0%";

    try {
      if (file) {
        const storageRef = ref(storage, "business_images/" + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Show progress bar
        progressContainer.classList.remove("hidden");

        // Monitor upload progress
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBarFill.style.width = `${progress}%`; // Update progress bar width
          },
          (error) => {
            console.error("Upload error:", error);
            alert("Error uploading image.");
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            updatedBusiness.image_url = downloadURL; // Add image URL to the object

            // Update Firestore document
            const businessRef = doc(db, "businesses", businessId);
            await updateDoc(businessRef, updatedBusiness);

            // Refresh data
            fetchBusinessData(userId);

            // Hide modal
            closeEditModal();
          }
        );
      } else {
        updatedBusiness.image_url = imageUrl || ""; // Keep existing image URL

        // Update Firestore document
        const businessRef = doc(db, "businesses", businessId);
        await updateDoc(businessRef, updatedBusiness);

        // Refresh data
        fetchBusinessData(userId);

        // Hide modal
        closeEditModal();
      }
    } catch (error) {
      console.error("Error updating business info:", error);
      alert("Error updating business information.");
    }
  };
};

// Close Edit Modal
window.closeEditModal = function () {
  document.getElementById("editModal").classList.add("hidden");
};

// Logout functionality
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}
const mobileLogoutButton = document.getElementById("mobileLogoutButton");
if (mobileLogoutButton) {
  mobileLogoutButton.addEventListener("click", logout);
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  window.location.href = "login.html";
}

// Mobile menu toggle
document
  .getElementById("mobile-menu-button")
  .addEventListener("click", () => {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("hidden");
  });

// User menu toggle
document.getElementById("user-menu-button").addEventListener("click", () => {
  const menu = document.getElementById("user-menu");
  menu.classList.toggle("hidden");
});

// Function to open the add/edit employee modal
function openEmployeeModal(employeeId = '', employeeName = '', employeePhone = '') {
    document.getElementById('employeeName').value = employeeName;
    document.getElementById('employeePhone').value = employeePhone;
    document.getElementById('employeeModal').classList.remove('hidden');
}

// Function to close the add/edit employee modal
function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.add('hidden');
}

// Event listener for the "Add Employee" button
document.getElementById('addEmployeeButton').addEventListener('click', () => {
    openEmployeeModal();
});

// Handle form submission for adding/editing employee
document.getElementById('employeeForm').onsubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const employeeName = document.getElementById('employeeName').value;
    const employeePhone = document.getElementById('employeePhone').value;

    try {
        // Add employee to Firestore
        const employeesRef = collection(db, 'employees');
        await addDoc(employeesRef, {
            name: employeeName,
            phone: employeePhone,
            businessId: userId // Assuming userId is the business ID
        });

        // Refresh employee data
        fetchEmployeeData(userId);

        // Hide modal
        closeEmployeeModal();
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Error adding employee.');
    }
};

// Function to fetch and display employee data
async function fetchEmployeeData(businessId) {
    try {
        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, where('businessId', '==', businessId));
        const querySnapshot = await getDocs(q);

        const employeesTableBody = document.getElementById('employees-table-body');
        employeesTableBody.innerHTML = ''; // Clear existing data

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const employeeRow = `
                    <tr data-id="${docSnap.id}">
                        <td class="px-4 py-2">${data.name}</td>
                        <td class="px-4 py-2">${data.phone}</td>
                        <td class="px-4 py-2">
                            <button onclick="openEmployeeModal('${docSnap.id}', '${data.name}', '${data.phone}')" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">Edit</button>
                            <button onclick="deleteEmployee('${docSnap.id}')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
                        </td>
                    </tr>
                `;
                employeesTableBody.innerHTML += employeeRow;
            });
        } else {
            employeesTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-black">No employees found.</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching employee data:', error);
        document.getElementById('employees-table-body').innerHTML = '<tr><td colspan="3" class="text-center text-red-500">Error loading employee data.</td></tr>';
    }
}

// Function to delete an employee
async function deleteEmployee(employeeId) {
    try {
        const employeeRef = doc(db, 'employees', employeeId);
        await deleteDoc(employeeRef);

        // Refresh employee data
        fetchEmployeeData(userId);
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee.');
    }
}

// Fetch employee data on page load
if (userId) {
    fetchEmployeeData(userId);
}

// Function to close the add/edit service modal
function closeServiceModal() {
  document.getElementById("serviceModal").classList.add("hidden");
}

// Event listener for the "Add Service" button
document.getElementById("addServiceButton").addEventListener("click", () => {
  openServiceModal();
});

// Handle form submission for adding/editing service
document.getElementById("serviceForm").onsubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission

  const serviceName = document.getElementById("serviceName").value;
  const servicePrice = document.getElementById("servicePrice").value;

  try {
    // Add service to Firestore
    const servicesRef = collection(db, "services");
    await addDoc(servicesRef, {
      name: serviceName,
      price: servicePrice,
      businessId: userId, // Assuming userId is the business ID
    });

    // Refresh service data
    fetchServiceData(userId);

    // Hide modal
    closeServiceModal();
  } catch (error) {
    console.error("Error adding service:", error);
    alert("Error adding service.");
  }
};

// Function to fetch and display service data
async function fetchServiceData(businessId) {
  try {
    const servicesRef = collection(db, "services");
    const q = query(servicesRef, where("businessId", "==", businessId));
    const querySnapshot = await getDocs(q);

    const servicesTableBody = document.getElementById("services-table-body");
    servicesTableBody.innerHTML = ""; // Clear existing data

    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const serviceRow = `
          <tr data-id="${docSnap.id}">
            <td class="px-4 py-2">${data.name}</td>
            <td class="px-4 py-2">${data.price}</td>
            <td class="px-4 py-2">
              <button onclick="openServiceModal('${docSnap.id}', '${data.name}', '${data.price}')" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">Edit</button>
              <button onclick="deleteService('${docSnap.id}')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Delete</button>
            </td>
          </tr>
        `;
        servicesTableBody.innerHTML += serviceRow;
      });
    } else {
      servicesTableBody.innerHTML =
        '<tr><td colspan="3" class="text-center text-black">No services found.</td></tr>';
    }
  } catch (error) {
    console.error("Error fetching service data:", error);
    document.getElementById("services-table-body").innerHTML =
      '<tr><td colspan="3" class="text-center text-red-500">Error loading service data.</td></tr>';
  }
}

// Function to delete a service
async function deleteService(serviceId) {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await deleteDoc(serviceRef);

    // Refresh service data
    fetchServiceData(userId);
  } catch (error) {
    console.error("Error deleting service:", error);
    alert("Error deleting service.");
  }
}

// Fetch service data on page load
if (userId) {
  fetchServiceData(userId);
}

// Function to open the add/edit service modal
function openServiceModal(serviceId = "", serviceName = "", servicePrice = "") {
  document.getElementById("serviceName").value = serviceName;
  document.getElementById("servicePrice").value = servicePrice;
  document.getElementById("serviceModal").classList.remove("hidden");

  // Update form submission logic
  document.getElementById("serviceForm").onsubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const serviceName = document.getElementById("serviceName").value;
    const servicePrice = document.getElementById("servicePrice").value;

    try {
      if (serviceId) {
        // Update existing service
        const serviceRef = doc(db, "services", serviceId);
        await updateDoc(serviceRef, {
          name: serviceName,
          price: servicePrice,
        });
      } else {
        // Add new service
        const servicesRef = collection(db, "services");
        await addDoc(servicesRef, {
          name: serviceName,
          price: servicePrice,
          businessId: userId, // Assuming userId is the business ID
        });
      }

      // Refresh service data
      fetchServiceData(userId);

      // Hide modal
      closeServiceModal();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error saving service.");
    }
  };
}
