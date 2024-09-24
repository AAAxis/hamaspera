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
  setDoc,
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
        const businessImage = data.image_url || "https://via.placeholder.com/60";

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

// Enable/disable time inputs based on checkbox
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const day = event.target.id.split('-')[0];
        document.getElementById(`${day}-from`).disabled = !event.target.checked;
        document.getElementById(`${day}-to`).disabled = !event.target.checked;
    });
});

// Save working hours
document.getElementById('saveWorkingHours').addEventListener('click', async () => {
    const workingHours = {};
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const day = checkbox.id.split('-')[0];
        workingHours[day] = {
            working: checkbox.checked,
            from: document.getElementById(`${day}-from`).value,
            to: document.getElementById(`${day}-to`).value
        };
    });

    try {
        const userId = localStorage.getItem('userId');
        const workingHoursRef = doc(db, 'working_hours', userId);
        await setDoc(workingHoursRef, { workingHours });
        alert('Working hours updated successfully');
    } catch (error) {
        console.error('Error updating working hours:', error);
        alert('Error updating working hours.');
    }
});