function ViewBtn(route, id) {
  axios
    .get(`/${route}`, {
      params: {
        id: id,
      },
    })
    .then((response) => {
      // console.log('Success:', response.data);
      window.open(`/${route}?id=${id}`, "_blank");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function BMI(heightId, weightId, bmiId) {
  const height = parseFloat(document.getElementById(heightId).value);
  const weight = parseFloat(document.getElementById(weightId).value);

  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    document.getElementById(bmiId).value = "Invalid input";
    return;
  }

  const heightInMeters = height * 0.3048;
  const bmi = weight / heightInMeters ** 2;
  document.getElementById(bmiId).value = bmi.toFixed(2);
}

function previewImage(event, previewId, removeBtnId) {
  const input = event.target;
  const preview = document.getElementById(previewId);
  const removeBtn = document.getElementById(removeBtnId);

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
      removeBtn.style.display = "inline-block";
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    preview.src = "";
    preview.style.display = "none";
    removeBtn.style.display = "none";
  }
}

function removeImage(inputId, previewId, removeBtnId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const removeBtn = document.getElementById(removeBtnId);

  input.value = ""; // Reset the file input
  preview.src = ""; // Clear the image source
  preview.style.display = "none"; // Hide the preview
  removeBtn.style.display = "none"; // Hide the remove button
}

const loadDropdown = (elementId, FieldId, key, selectedValue = null) => {
  // Append elementId to the URL as a query parameter
  const modifiedUrl = `/getDataFromField?elementId=${FieldId}`;

  fetch(modifiedUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error fetching data from ${modifiedUrl}`);
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      const dropdown = document.getElementById(elementId);
      dropdown.innerHTML = '<option value="">Select</option>'; // Clear existing options and add a default one

      // Loop through the data to create options
      data.data.forEach((item) => {
        const option = document.createElement("option");

        // If elementId is "Doctor", set value as item.id, otherwise use item[key]
        option.value = elementId === "Doctor" ? item.id : item[key];
        option.textContent = item[key]; // Display text remains the same
        option.setAttribute("data-id", item.id); // Set data-id attribute

        dropdown.appendChild(option);
      });

      // Add "Add New" option **only if elementId is "Specialization"**
      if (elementId === "Specialization" || "Department") {
        const addNewOption = document.createElement("option");
        addNewOption.value = "add-new";
        addNewOption.textContent = "Add New";
        dropdown.appendChild(addNewOption);
      }

      // Set the value after the dropdown has been populated
      if (selectedValue) {
        dropdown.value = selectedValue;
      }
    })
    .catch((error) =>
      console.error(`Error fetching ${elementId} details:`, error)
    );
};

const generateQRCodeInDiv = (divId, route, clinicId, size = 150) => {
  const windowOrigin = window.origin;
  const url = `${windowOrigin}/${route}?clinic_id=${clinicId}`;
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
    targetDiv.innerHTML = "";

    // Generate the QR code with specified size
    QRCode.toDataURL(url, { width: size, height: size }, function (err, url) {
      if (err) {
        console.error("Error generating QR code:", err);
      } else {
        const imgElement = document.createElement("img");
        imgElement.src = url;
        imgElement.width = size; // Set size of the image
        imgElement.height = size;
        targetDiv.appendChild(imgElement);
      }
    });
  } else {
    console.error("No div found with the ID:", divId);
  }
};

async function saveJsonForm(formId, endpoint, arrayObj = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const form = document.getElementById(formId.substring(1));
      if (!form) throw new Error(`Form with ID '${formId}' not found.`);

      // Collect form data as a JSON object
      const formData = new FormData(form);
      const jsonData = {};
      for (let [key, value] of formData.entries()) {
        jsonData[key] = value;
      }

      // Merge arrayObj into jsonData if provided
      if (arrayObj && Array.isArray(arrayObj)) {
        arrayObj.forEach((item) => {
          for (let key in item) {
            if (item.hasOwnProperty(key)) {
              // If the key already exists, append data; otherwise, set it
              if (Array.isArray(jsonData[key])) {
                jsonData[key] = [...jsonData[key], ...item[key]];
              } else {
                jsonData[key] = item[key];
              }
            }
          }
        });
      }

      console.log("Form data as JSON after adding arrayObj:", jsonData);

      // Submit the JSON data using axios
      const response = await axios.post(endpoint, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      resolve(response.data);
    } catch (error) {
      console.error("Error submitting the JSON form:", error);
      reject(error.response ? error.response.data : error);
    }
  });
}

function createSmallModal(id, heading, path) {
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = id;
  modal.tabIndex = -1;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="modal-dialog modal-sm" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${heading}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col mb-6">
              <label for="input${id}" class="form-label">${heading}</label>
              <input type="text" id="input${id}" class="form-control" placeholder="" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="button" onclick="saveModalData('${id}', '${path}')" class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  $(`#${id}`).modal("show");
}

async function saveModalData(id, path) {
  const inputValue = document.getElementById(`input${id}`).value.trim();
  if (!inputValue) {
    alert("Please enter a value");
    return;
  }

  try {
    await axios.post(path, { name: inputValue });
    $(`#${id}`).modal("hide");
    document.getElementById(`input${id}`).value = "";
  } catch (error) {
    console.log(error);
    alert(error.response?.data?.message || "An error occurred");
  }
}


 // Function to collect form data
          function collectFormDataWithTbl(formId,tblId) {
  const formData = {};

  // Collect non-table input and select values from the form
  $(`${formId} input, ${formId} select, ${formId} textarea`).each(function () {
    const key = $(this).attr('name');
    if (key) {
      formData[key] = $(this).val().trim();
    }
  });

  // Collect table data
  const tableData = [];
  $(`${tblId} tbody tr`).each(function () {
    const row = {};
    $(this).find('td, input').each(function () {
      const key = $(this).attr('data-key');
      if (key) {
        row[key] = $(this).is('input') ? $(this).val().trim() : $(this).text().trim();
      }
    });
    tableData.push(row);
  });

  formData['tableData'] = tableData; // Attach table data to JSON

  return formData;
}
 // Function to collect form data with table
 function collectFormDataWithTbl(formId,tblId) {
  const formData = {};

  // Collect non-table input and select values from the form
  $(`${formId} input, ${formId} select, ${formId} textarea`).each(function () {
    const key = $(this).attr('name');
    if (key) {
      formData[key] = $(this).val().trim();
    }
  });

  // Collect table data
  const tableData = [];
  $(`${tblId} tbody tr`).each(function () {
    const row = {};
    $(this).find('td, input').each(function () {
      const key = $(this).attr('data-key');
      if (key) {
        row[key] = $(this).is('input') ? $(this).val().trim() : $(this).text().trim();
      }
    });
    tableData.push(row);
  });

  formData['tableData'] = tableData; // Attach table data to JSON

  return formData;
}


function loadState(a, val = null) {
  fetch('/getStates')
      .then(response => response.json())
      .then(data => {
          const dropdown = document.getElementById(a);
          dropdown.innerHTML = '<option value="">Select State</option>'; // Reset dropdown

          data.forEach(state => {
              const option = document.createElement('option');
              option.value = state.stateCode;
              option.textContent = state.stateName;
              dropdown.appendChild(option);
          });

          if (val) {
              dropdown.value = val;
              dropdown.dispatchEvent(new Event('change')); // Trigger change event if value is set
          }
      })
      .catch(error => console.error('Error fetching states:', error));
}

  function loadCity(stateCode,id) {
    fetch('/cities')
        .then(response => response.json())
        .then(data => {
  
            const cityDropdown = document.getElementById(id);
            cityDropdown.innerHTML = '<option value="">Select City</option>'; // Reset dropdown

            const filteredCities = data.filter(city => city.stateCode === stateCode.value);
            filteredCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.cityName;
                option.textContent = city.cityName;
                cityDropdown.appendChild(option);
            });
            console.log(filteredCities)
        })
        .catch(error => console.error('Error fetching cities:', error));
}
