let buildsData = []; // Store all the build data here
let currentPage = 1;  // Keep track of the current page
const buildsPerPage = 20; // Number of builds to show per page (set to 1 for testing)

// Fetch builds from the server
async function fetchBuilds() {
  try {
    const response = await fetch('/tests');  // Make a GET request to the /builds endpoint
    const data = await response.json();  // Parse the JSON response
    // Populate Builds Table
    buildsData = data.builds;
    populateTable(buildsData);

    // Populate Tests Table
    const testsData = data.tests;
    populateTestsTable(testsData);  // Populate the table with the data
     
    setupPagination(data.length);  // Make sure to pass the length of the data
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Populate Tests Table
function populateTestsTable(data) {
  const tableBody = document.querySelector('#tests-table tbody');
  tableBody.innerHTML = '';

  // Sort the data by test_count in descending order
  data.sort((a, b) => b.test_count - a.test_count);

  data.forEach(test => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><a href="/test/${test.testname}" target="_self">${test.testname}</a></td>
      <td>${test.test_count}</td>
      <td>${test.testclass}</td>
      <td>${test.testpackage}</td>
    `;
    tableBody.appendChild(tr);
  });
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

   // Ensure build.test_results is an array
   const testResults = build.test_results || []; // Example: ['fail', 'pass', 'fail', 'fail', 'fail']
    
   // Determine the dot color based on last 3 test results
   let dotColor = 'green'; // Default color

   if (testResults.length >= 3) {
     const lastThreeTests = testResults.slice(-3); // Get last 3 test results
     if (lastThreeTests.every(result => result === 'fail')) {
       dotColor = 'red'; // Mark as red if last 3 tests were all failures
     } else if (lastThreeTests.some(result => result === 'fail')) {
       dotColor = 'yellow'; // Mark as yellow if at least one failure occurred in last 3 tests
     }
   } 
    tr.innerHTML = `
      <td><a href="/build/${build.buildnumber}" target="_self">${build.buildnumber}</a></td>
      <td>${new Date(build.startdate).toLocaleString()}</td>
      <td>${new Date(build.finishdate).toLocaleString()}</td>
      <td>${build.duration}</td>
      <td>${build.buildname}</td>
      <td><a href="https://build.seeburger.de/build/job/${build.buildname}/${build.buildnumber}/" target="_blank">Build Link</a></td>
      <td>${build.test_count}</td> <!-- Display test count -->
      <td>
        <span 
          style="display: inline-block; width: 15px; height: 15px; border-radius: 50%; background-color: ${dotColor};">
        </span>
      </td>
    `;


   

    tableBody.appendChild(tr);
  });
}


// Function to set up pagination
function setupPagination(totalBuilds) {
  console.log('Total builds:', totalBuilds);  // Log to check the number of builds
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = '';  // Clear previous pagination

  const totalPages = Math.ceil(totalBuilds / buildsPerPage);
  console.log('Total pages:', totalPages);  // Log the number of pages

  // If no pages need to be created, exit the function
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';  // Hide pagination if there's only one page
    return;
  }

  // Add page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.add('page-button');
    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentPage = i;
      populateTable(buildsData);
      updatePagination();
    });

    paginationContainer.appendChild(button);
  }
}


// Update the active page button
function updatePagination() {
  const paginationContainer = document.getElementById('pagination-container');
  const buttons = paginationContainer.querySelectorAll('button');
  buttons.forEach(button => {
    if (parseInt(button.textContent) === currentPage) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// Function to filter data by selected job from dropdown
function filterByJob() {
  const selectedJob = document.getElementById('job-select').value.trim(); // Get the selected job and trim whitespace

  // Filter the data in memory instead of refetching
  let filteredData;

  // If no job is selected, use all data
  if (!selectedJob) {
    filteredData = buildsData;
  } else {
    // Filter the data by the selected job
    filteredData = buildsData.filter(build =>
      build.buildname && build.buildname.trim().toLowerCase() === selectedJob.toLowerCase()
    );
  }

  // Update pagination and display filtered data
  setupPagination(filteredData.length); // Update pagination for filtered data
  populateTable(filteredData); // Populate table with filtered data
}
// Function to filter data by selected date range
// Function to filter data by selected date range
function filterByDateRange() {
  const fromDate = document.getElementById('from-date').value; // Get 'from' date
  const endDate = document.getElementById('end-date').value;   // Get 'to' date

  // Filter the data in memory instead of refetching
  let filteredData = buildsData;

  // If both dates are provided, filter the data
  if (fromDate || endDate) {
    filteredData = buildsData.filter(build => {
      const buildStartDate = new Date(build.startdate); // Convert startdate to a Date object

      // Compare with 'fromDate' and 'endDate' if provided
      return (
        (!fromDate || buildStartDate >= new Date(fromDate)) &&
        (!endDate || buildStartDate <= new Date(endDate))
      );
    });
  }

  // Show filtered data in table
  populateTable(filteredData);
  setupPagination(filteredData.length);
}


// Function to reset date filters
function resetDateFilters() {
  document.getElementById('from-date').value = ''; // Clear 'from' date
  document.getElementById('end-date').value = '';  // Clear 'to' date
  fetchBuilds(); // Reload all data
}

// Initialize Flatpickr for date inputs
function initializeDatePickers() {
  flatpickr("#from-date", {
    dateFormat: "m-d-Y", // Format dates as "Year-Month-Day"
    allowInput: true, // Allow manual input of dates
  });

  flatpickr("#end-date", {
    dateFormat: "m-d-Y", // Format dates as "Year-Month-Day"
    allowInput: true, // Allow manual input of dates
  });
}

// Call this function after page load to initialize date pickers
initializeDatePickers();

// Set interval to update the time every second
function updateTime() {
  const timeElement = document.getElementById('time');
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}:${seconds}`;
  timeElement.textContent = currentTime;
}

setInterval(updateTime, 1000);  // Update the time every second

// Fetch and display data when the page loads
fetchBuilds();
initializeDatePickers();  // Initialize the date pickers
