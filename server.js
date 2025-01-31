const express = require('express');
const { Client } = require('pg');
const path = require('path');

// Create the Express app
const app = express();
const port = 3000;

// Connect to PostgreSQL
const client = new Client({
  user: 'postgres',      // Your PostgreSQL username
  host: 'localhost',     // Database host
  database: 'postgres',  // Your PostgreSQL database name
  password: 'postgres',  // Your PostgreSQL password
  port: 5432,            // PostgreSQL port (default 5432)
});

client.connect();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get all builds from the PostgreSQL database
app.get('/tests', async (req, res) => {
  try {
    const buildsQuery = `
        SELECT 
      tests.buildnumber, 
      MIN(tests.startdate) AS startdate, 
      MAX(tests.finishdate) AS finishdate, 
      EXTRACT(EPOCH FROM (MAX(tests.finishdate) - MIN(tests.startdate))) AS duration,
      tests.buildname,
      COUNT(tests.testname) AS fail_count,  -- Count all associated test names as failures
      COUNT(tests.testname) AS test_count  -- Same as fail_count in this case
  FROM tests
  GROUP BY tests.buildnumber, tests.buildname;
    `;

    const testsQuery = `
      SELECT 
        tests.buildnumber, 
        tests.testname, 
        tests.testclass,  -- Include testclass column
        tests.testpackage,
        COUNT(testname) AS test_count
      FROM tests
      GROUP BY tests.buildnumber, tests.testname, tests.testclass, tests.testpackage 
      ORDER BY tests.buildnumber, test_count DESC;
    `;
    
    // Execute both queries
    const [buildsResult, testsResult] = await Promise.all([
      client.query(buildsQuery),
      client.query(testsQuery),
    ]);
    
    // Send the query results as JSON
    res.json({ builds: buildsResult.rows, tests: testsResult.rows }); 
  } catch (err) {
    console.error('Error fetching data from database', err);
    res.status(500).send('Internal Server Error');
  }
});

// Serve the build details HTML page with data
app.get('/build/:buildNumber', async (req, res) => {
  const buildNumber = req.params.buildNumber;

  try {
    // Fetch build details
    const buildDetailsQuery = `
      SELECT DISTINCT tests.buildnumber, tests.startdate, tests.finishdate
      FROM tests
      WHERE tests.buildnumber = $1;
    `;
    const buildResult = await client.query(buildDetailsQuery, [buildNumber]);

    if (buildResult.rows.length === 0) {
      return res.status(404).send('Build not found');
    }

    const buildDetails = buildResult.rows[0];

    // Fetch tests associated with the build
    const testsQuery = `
      SELECT tests.testname,tests.testclass, tests.testpackage, COUNT(tests.testname) AS test_count
      FROM tests
      WHERE tests.buildnumber = $1
      GROUP BY tests.testname, tests.testclass, tests.testpackage;
    `;
    const testsResult = await client.query(testsQuery, [buildNumber]);

    const tests = testsResult.rows;

    // Render the build-details page
    res.render('build-details', { buildDetails, tests });
  } catch (err) {
    console.error('Error fetching build data:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/test/:testName', async (req, res) => {
  const testName = req.params.testName;

  try {
    // Fetch details about the specific test from the database
    const testQuery = `
      SELECT 
        tests.buildnumber, 
        tests.testname
      FROM tests
      WHERE tests.testname = $1;
    `;

    const testResult = await client.query(testQuery, [testName]);

    if (testResult.rows.length === 0) {
      return res.status(404).send('Test not found');
    }

    const testDetails = testResult.rows[0];

    // Render the test-details page
    res.render('test-details', { testDetails });
  } catch (err) {
    console.error('Error fetching test data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Function to fetch a specific build by buildnumber
async function getBuildByNumber(buildnumber) {
  try {
    const query = `
      SELECT DISTINCT builds.buildnumber, builds.startdate, builds.finishdate, builds.duration, tests.buildname 
      FROM builds 
      INNER JOIN tests ON builds.buildnumber = tests.buildnumber
      WHERE builds.buildnumber = $1;
    `;
    const result = await client.query(query, [buildnumber]);
    return result.rows[0]; // Return the first matching build
  } catch (err) {
    console.error('Error fetching build data:', err);
    return null;
  }
}

// Serve the build details HTML page
app.get('/build/:buildNumber', (req, res) => {
  const buildNumber = req.params.buildNumber;
  // Fetch build details using the buildNumber, for example, from the database
  const buildDetails = {
    buildNumber: buildNumber,
    startDate: '2025-01-20',
    finishDate: '2025-01-22',
    duration: '48 hours',
    otherDetails: 'Details about this specific build...'
  };

  // Render the build-details page and pass the build details to the template
  res.render('build-details', { buildDetails });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
