// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  addDoc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
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

// Fetch services for the barbershop
async function fetchServices(barbershopId) {
  const serviceSelect = document.getElementById('serviceSelect');
  try {
    const q = query(collection(db, 'services'), where('barbershopId', '==', barbershopId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = data.name;
      option.textContent = data.name;
      serviceSelect.appendChild(option);
    });
  } catch (e) {
    console.error("Error fetching services: ", e);
  }
}

// Call fetchServices when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const barbershopId = "{{ barbershop_id }}"; // This ID should be passed from the URL or context
  if (barbershopId) {
    fetchServices(barbershopId);
  } else {
    console.error("Barbershop ID not provided.");
  }
});

// Add event listener to the service form
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const selectedService = document.getElementById('serviceSelect').value;
  const bookingDate = document.getElementById('bookingDate').value;
  const bookingTime = document.getElementById('bookingTime').value;

  // Here you would typically make an API call to book the service
  // For example:
  const response = await fetch('/api/bookService', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ service: selectedService, date: bookingDate, time: bookingTime })
  });
  const data = await response.json();
  console.log(data);
});

async function fetchAvailableSlots(barbershopId) {
  try {
    const slotsRef = collection(db, 'slots');
    const q = query(slotsRef, where('barbershopId', '==', barbershopId));
    const querySnapshot = await getDocs(q);

    const slotContainer = document.getElementById('slotContainer');
    slotContainer.innerHTML = ''; // Clear any existing slots

    if (querySnapshot.empty) {
      slotContainer.innerHTML = '<p>No available slots.</p>';
    } else {
      querySnapshot.forEach((doc) => {
        const slotData = doc.data();
        const slotElement = document.createElement('div');
        slotElement.classList.add('slot-item');
        slotElement.innerHTML = `
          <p>Date: ${slotData.date}</p>
          <p>Time: ${slotData.time}</p>
        `;
        slotContainer.appendChild(slotElement);
      });
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const barbershopId = "{{ barbershop_id }}"; // Assuming you have the barbershop ID from the context or URL
  fetchAvailableSlots(barbershopId);
});







