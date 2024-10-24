import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
    import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
    // Firebase configuration
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
    // Declare store globally
    let store;

   

    async function fetchBarbershopData(barbershopId) {
        try {
            const docRef = doc(db, 'businesses', barbershopId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();

                const logoImage = document.getElementById('logoImage');
                if (logoImage) {
                    logoImage.src = data.image_url;
                }

                const background = document.getElementById('background');
                if (background) {
                    background.style.backgroundImage = `url(${data.background})`;
                }

                const barbershopName = document.getElementById('barbershopName');
                if (barbershopName) {
                    barbershopName.textContent = data.business_name;
                }

                const serviceDescription = document.getElementById('serviceDescription');
                if (serviceDescription) {
                    serviceDescription.textContent = data.service || 'No type provided';
                }

                const instagram = data.instagram || 'No instagram provided';
                const phone = data.phone || 'No phone number provided';
                const address = data.address || 'No address provided';

                store = data.uid || 'No address provided'; // Set store here

                // Add event listener for the Instagram icon
                const instagramIcon = document.getElementById('instagramIcon');
                if (instagramIcon) {
                    instagramIcon.addEventListener('click', () => {
                        window.open(instagram, '_blank'); // Open in a new tab
                    });
                }

                const phoneIcon = document.getElementById('phoneIcon');
                if (phoneIcon) {
                    phoneIcon.addEventListener('click', () => {
                        window.location.href = `tel:${phone}`;
                    });
                }

                const addressIcon = document.getElementById('addressIcon');
                if (addressIcon) {
                    addressIcon.addEventListener('click', () => {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                    });
                }

            } else {
                console.error('No such document!');
            }
        } catch (e) {
            console.error("Error fetching barbershop data:", e);
        }
    }
    document.getElementById('orderButton').addEventListener('click', async () => {
    const serviceId = document.getElementById('serviceSelect').value;
    const employeeId = document.getElementById('employeeSelect').value;
    const date = document.getElementById('dateSelect').value;
    const time = document.getElementById('timeSelect').value;

    if (!serviceId || !employeeId || !date || !time) {
        alert("Please select a service, an employee, and a date/time.");
        return;
    }

    const dateTime = `${date}T${time}`;
    const orderUrl = `/order?datetime=${encodeURIComponent(dateTime)}&store=${encodeURIComponent(store)}`;
    window.location.href = orderUrl;
});

async function fetchWorkingHoursForToday() {
    try {
        const workingHoursRef = doc(db, 'working_hours', store);
        const workingHoursDoc = await getDoc(workingHoursRef);

        if (workingHoursDoc.exists()) {
            const workingHours = workingHoursDoc.data().workingHours;
            const workingHoursDiv = document.getElementById('workingHours');
            
            if (!workingHoursDiv) {
                console.error('Element with ID "workingHours" not found.');
                return;
            }

            workingHoursDiv.innerHTML = ''; // Clear previous content

            // Get today's day name
            const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
            const todayHours = workingHours[today];

            if (todayHours && todayHours.working) {
                // If the store is open today, display the hours
                workingHoursDiv.textContent = `Open: ${todayHours.from} - Close: ${todayHours.to}`;
            } else {
                // If the store is closed today
                workingHoursDiv.textContent = 'Closed today';
            }
        } else {
            console.error('No working hours found for this store.');
        }
    } catch (e) {
        console.error("Error fetching working hours:", e);
    }
}

async function fetchServices() {
    console.log('User ID:', store);

    if (!store) {
        console.error('User ID not found.');
        return;
    }

    const servicesQuery = query(collection(db, 'services'), where('userId', '==', store));
    const querySnapshot = await getDocs(servicesQuery);

    // Process service data
    const serviceSelect = document.getElementById('serviceSelect');
    serviceSelect.innerHTML = '<option value="">Select a service</option>'; // Clear previous options

    let firstServiceId = ''; // To store the first available service ID

    querySnapshot.forEach((doc, index) => {
        const serviceData = doc.data();
        console.log('Service Data:', serviceData);

        const option = document.createElement('option');
        option.value = doc.id; // Service document ID
        option.textContent = serviceData.name; // Service name
        serviceSelect.appendChild(option);

        if (index === 0) {
            firstServiceId = doc.id; // Save the first service ID
        }
    });

    if (firstServiceId) {
        serviceSelect.value = firstServiceId; // Automatically select the first service
        await fetchServiceEmployees(firstServiceId); // Fetch employees for the first service
    }

    // Add event listener for services dropdown
    serviceSelect.addEventListener('change', async (event) => {
        const serviceId = event.target.value;
        if (serviceId) {
            await fetchServiceEmployees(serviceId);
        } else {
            // Clear employee select if no service is selected
            document.getElementById('employeeSelect').innerHTML = '<option value="">Select an employee</option>';
        }
    });
}

async function fetchServiceEmployees(serviceId) {
    const employeesQuery = query(collection(db, 'employees'), where('services', 'array-contains', serviceId));
    const querySnapshot = await getDocs(employeesQuery);

    const employeeSelect = document.getElementById('employeeSelect');
    employeeSelect.innerHTML = ''; // Clear previous options

    // Always add "Any Employee" option and preselect it
    const anyEmployeeOption = document.createElement('option');
    anyEmployeeOption.value = 'any';
    anyEmployeeOption.textContent = 'Any Employee';
    employeeSelect.appendChild(anyEmployeeOption);

    // Populate employee options
    querySnapshot.forEach((doc) => {
        const employeeData = doc.data();
        console.log('Employee Data:', employeeData);

        const option = document.createElement('option');
        option.value = doc.id; // Employee document ID
        option.textContent = employeeData.name; // Employee name
        employeeSelect.appendChild(option);
    });

    // Preselect "Any Employee" by default, regardless of the number of employees
    employeeSelect.value = 'any';
}

    async function populateDays() {
        const daySelect = document.getElementById('dateSelect');
        const today = new Date();
        const options = { weekday: 'long', month: '2-digit', day: '2-digit' };

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dayName = date.toLocaleDateString('en-US', options);
            const option = document.createElement('option');
            option.value = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            option.textContent = `${dayName}`;
            daySelect.appendChild(option);
        }
    }


document.addEventListener('DOMContentLoaded', async () => {
    await populateDays();
    await fetchBarbershopData("{{ barbershop_id }}");
    await fetchServices();
    await fetchGallery();
    await fetchWorkingHoursForToday();
});

    async function fetchGallery() {
        try {
            const servicesQuery = query(collection(db, 'services'), where('userId', '==', store));
            const querySnapshot = await getDocs(servicesQuery);

            console.log('Query Snapshot:', querySnapshot);

            const galleryDiv = document.getElementById('gallery');
            galleryDiv.innerHTML = ''; // Clear previous images

            if (querySnapshot.empty) {
                console.log('No services found for this user ID.');
                return;
            }

            querySnapshot.forEach((doc) => {
                const serviceData = doc.data();
                console.log('Service Data:', serviceData);

                const image = serviceData.image; // Directly use the image field
                const name = serviceData.name; // Directly use the image field
                if (image) {
                    console.log('Image URL:', image);
                    const imgDiv = document.createElement('div');
                    imgDiv.className = 'w-full h-96 bg-white flex items-center justify-center rounded-lg';
                    const img = document.createElement('img');
                    img.src = image; // Set image source correctly
                    img.alt = 'Service Image';
                    img.title = name; // Set the service name as the title
                    img.className = 'w-full h-full rounded-lg mx-4 scrollbar-hide';
                    imgDiv.appendChild(img);
                    galleryDiv.appendChild(imgDiv);
                } else {
                    console.warn('No image URL found for service:', name);
                }
            });
        } catch (error) {
            console.error("Error fetching gallery images:", error);
        }
    }

    document.getElementById('orderButton').addEventListener('click', async () => {
    const serviceSelect = document.getElementById('serviceSelect');
    const employeeSelect = document.getElementById('employeeSelect');
    const date = document.getElementById('dateSelect').value;
    const time = document.getElementById('timeSelect').value;

    if (!serviceSelect.value || !employeeSelect.value || !date || !time) {
        alert("Please select a service, an employee, and a date/time.");
        return;
    }

    // Get selected service and employee names
    const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
    const employeeName = employeeSelect.options[employeeSelect.selectedIndex].text;

    const dateTime = `${date}T${time}`;
    
    // Construct the URL with service and employee names
    const orderUrl = `/order?datetime=${encodeURIComponent(dateTime)}&store=${encodeURIComponent(store)}&service=${encodeURIComponent(serviceName)}&employee=${encodeURIComponent(employeeName)}`;
    
    window.location.href = orderUrl;
});


    document.addEventListener('DOMContentLoaded', async () => {
        const barbershopId = "{{ barbershop_id }}";
        if (barbershopId) {
            await fetchBarbershopData(barbershopId);
        }
    });
