import { addDocument, uploadFile } from './firebaseUtils.js';

document.getElementById('addEmployeeForm').onsubmit = async (e) => {
  e.preventDefault();
  const employeeName = document.getElementById('employeeName').value;
  const employeePhone = document.getElementById('employeePhone').value;
  const employeeImageFile = document.getElementById('employeeImage').files[0];

  try {
    const imageURL = await uploadFile(employeeImageFile, `employees/${employeeImageFile.name}`);
    await addDocument('employees', {
      name: employeeName,
      phone: employeePhone,
      image: imageURL,
    });
    loadEmployees();
  } catch (error) {
    console.error('Error adding employee:', error);
  }
};
