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
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual API key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your actual auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your actual project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your actual storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your actual messaging sender ID
  appId: "YOUR_APP_ID", // Replace with your actual app ID
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
        const businessImage = data.image_url || "https://via.placeholder.com/60";

        const businessRow = `
          <tr>
            <td class="px-4 py-2"><img src="${businessImage}" alt="${data.business_name}" class="h-10 w-10 rounded-full"></td>
            <td class="px-4 py-2">${data.business_name}</td>
            <td class="px-4 py-2">${data.address}</td>
            <td class="px-4 py-2">${data.email}</td>
            <td class="px-4 py-2">${data.phone}</td>
            <td class="px-4 py-2">${data.service}</td>
            <td class="px-4 py-2">${data.working_hours}</td>
            <td class="px-4 py-2">${data.services}</td>
            <td class="px-4 py-2">${data.services_prices}</td>
            <td class="px-4 py-2">${data.services_descriptions}</td>
            <td class="px-4 py-2">
              <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onclick="openEditModal('${docSnap.id}', '${escapeQuotes(data.business_name)}', '${escapeQuotes(data.address)}', '${escapeQuotes(data.email)}', '${escapeQuotes(data.phone)}', '${escapeQuotes(data.service)}', '${escapeQuotes(data.image_url)}', '${escapeQuotes(data.working_hours)}', '${escapeQuotes(data.services)}', '${escapeQuotes(data.services_prices)}', '${escapeQuotes(data.services_descriptions)}')">Edit</button>
            </td>
          </tr>
        `;

        businessTableBody.innerHTML += businessRow;
      });
    } else {
      businessTableBody.innerHTML =
        '<tr><td colspan="11" class="text-center text-black">No business data found.</td></tr>';
    }
  } catch (error) {
    console.error("Error fetching business data:", error);
    document.getElementById("business-table-body").innerHTML =
      '<tr><td colspan="11" class="text-center text-red-500">Error loading business data.</td></tr>';
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
  businessService,
  imageUrl,
  working_hours,
  services,
  services_prices,
  services_descriptions
) {
  // Populate form fields with existing data
  document.getElementById("businessName").value = businessName || "";
  document.getElementById("businessAddress").value = businessAddress || "";
  document.getElementById("businessEmail").value = businessEmail || "";
  document.getElementById("businessPhone").value = businessPhone || "";
  document.getElementById("businessService").value = businessService || "";
  document.getElementById("businessImage").value = ""; // Clear file input
  document.getElementById("cover_images").value = ""; // Clear file input
  document.getElementById("cover_images_urls").value = ""; // Clear URLs input
  document.getElementById("working_hours").value = working_hours || "";
  document.getElementById("services").value = services || "";
  document.getElementById("services_prices").value = services_prices || "";
  document.getElementById("services_descriptions").value =
    services_descriptions || "";

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
      service: document.getElementById("businessService").value,
      working_hours: document.getElementById("working_hours").value,
      services: document.getElementById("services").value,
      services_prices: document.getElementById("services_prices").value || "",
      services_descriptions:
        document.getElementById("services_descriptions").value || "",
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
