let buildsData = []; // Store all the build data here
let currentPage = 1;  // Keep track of the current page
const buildsPerPage = 10; // Number of builds to show per page (set to 1 for testing)

// Fetch builds from the server
async function fetchBuilds() {
  try {
    const response = await fetch('/test3');  // Make a GET request to the /builds endpoint
    const data = await response.json();  // Parse the JSON response
    buildsData = data; // Store the data for later use
    populateTable(data);  // Populate the table with the data
    setupPagination(data.length); // Set up pagination after data is fetched
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to populate the table with data
function populateTable(data) {
  const tableBody = document.querySelector('#data-table tbody');
  tableBody.innerHTML = '';  // Clear any existing rows

  // Get the data to display based on the current page
  const start = (currentPage - 1) * buildsPerPage;
  const end = start + buildsPerPage;
  const buildsToDisplay = data.slice(start, end);

  buildsToDisplay.forEach(build => {
    // Generate the dynamic link for each build
    const buildLink = `/build/${build.buildnumber}`;
    const tr = document.createElement('tr');

    // Check if any test failed more than 3 times
    let redClass = '';
    if (build.failure_count > 3) {
      redClass = 'red'; // Apply the red class if failure count is more than 3
    }

    tr.innerHTML = `
      <td><a href="${buildLink}" target="_self">${build.buildnumber}</a></td>
      <td>${new Date(build.startdate).toLocaleString()}</td>
      <td>${new Date(build.finishdate).toLocaleString()}</td>
      <td>${build.duration}</td>
      <td>${build.buildname}</td>
      <td><a href="https://build.seeburger.de/build/job/${build.buildname}/${build.buildnumber}/" target="_blank">Build Link</a></td>
    `;
    // Check if test has failed more than 3 times and apply a red style
    if (redClass) {
        tr.classList.add(redClass); // Add the red class
      }
  
      tableBody.appendChild(tr);
    });
  }
  