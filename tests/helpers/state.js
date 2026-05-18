// Shared state between the serial happy-path tests.
//
// Each test mutates this object as the pipeline progresses (registration
// creates accounts, MOU approval flips a flag, internship creation captures
// the ID, etc.). Because the spec uses `test.describe.serial` with a single
// worker, simple module-scoped mutation is safe.

const stamp = Date.now().toString();
const last5 = stamp.slice(-5);
const last8 = stamp.slice(-8);

// Institutional IDs must be exactly 11 / 8 / 9 chars to detect the right role.
const studentId = ("66070" + last5 + "00").slice(0, 11).padEnd(11, "0");
const companyId = ("CO" + last5 + "Z").slice(0, 8).padEnd(8, "X");
const staffId = ("ST" + last5 + "ZZ").slice(0, 9).padEnd(9, "X");

export const state = {
  runId: stamp,
  student: {
    firstName: "Test",
    lastName: "Student" + last5,
    email: `student.${last8}@e2e.local`,
    userId: studentId,
    password: "Passw0rd12",
  },
  company: {
    firstName: "Acme",
    lastName: "Corp" + last5,
    email: `company.${last8}@e2e.local`,
    userId: companyId,
    password: "Passw0rd12",
  },
  staff: {
    firstName: "Dean",
    lastName: "Office" + last5,
    email: `staff.${last8}@e2e.local`,
    userId: staffId,
    password: "Passw0rd12",
  },
  // Filled in as the pipeline progresses.
  internshipTitle: `Playwright Intern ${last5}`,
  internshipId: null,
  applicationStatusSeen: null,
};
