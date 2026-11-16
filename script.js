// MAgeCalculator - Jalali age calculator

const JALALI_BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818,
  1111, 1181, 1210, 1635, 2060, 2097,
  2192, 2262, 2324, 2394, 2456, 3178
];

// Check whether a Jalali year is a leap year.
function isLeapYear(year) {
  if (!Number.isInteger(year) || year < 1 || year >= 3178) {
    throw new Error("Year must be between 1 and 3177.");
  }

  let leapJ = -14;
  let jp = JALALI_BREAKS[0];
  let jump = 0;

  for (let i = 1; i < JALALI_BREAKS.length; i++) {
    const jm = JALALI_BREAKS[i];
    jump = jm - jp;

    if (year < jm) break;

    leapJ += Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4);
    jp = jm;
  }

  const n = year - jp;
  leapJ += Math.floor((n / 33)) * 8 + Math.floor(((n % 33) + 3) / 4);

  if ((jump % 33) === 4 && (jump - n) === 4) {
    leapJ += 1;
  }

  let remainder = n;
  if (jump - n < 6) {
    remainder = n - jump + Math.floor((jump + 4) / 33) * 33;
  }

  let leap = (((remainder + 1) % 33) - 1) % 4;
  if (leap === -1) leap = 4;

  return leap === 0;
}

// Return the number of days in a Jalali month.
function daysInMonth(year, month) {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  if (month === 12) return isLeapYear(year) ? 30 : 29;
  throw new Error("Month must be between 1 and 12.");
}

function readDate(prefix, title) {
  const year = Number(document.getElementById(`${prefix}-year`).value);
  const month = Number(document.getElementById(`${prefix}-month`).value);
  const day = Number(document.getElementById(`${prefix}-day`).value);

  const rawValues = [
    document.getElementById(`${prefix}-year`).value.trim(),
    document.getElementById(`${prefix}-month`).value.trim(),
    document.getElementById(`${prefix}-day`).value.trim()
  ];

  if (rawValues.some(value => value === "")) {
    throw new Error(`Please complete all fields for ${title}.`);
  }

  if (![year, month, day].every(Number.isInteger)) {
    throw new Error(`${title}: enter whole numbers only.`);
  }

  if (year < 1 || year >= 3178) {
    throw new Error(`${title}: year must be between 1 and 3177.`);
  }

  if (month < 1 || month > 12) {
    throw new Error(`${title}: month must be between 1 and 12.`);
  }

  const maxDay = daysInMonth(year, month);
  if (day < 1 || day > maxDay) {
    throw new Error(`${title}: day must be between 1 and ${maxDay}.`);
  }

  return { year, month, day };
}

// Calculate the age between two valid Jalali dates.
function calculateAge(birth, today) {
  const birthKey = [birth.year, birth.month, birth.day];
  const todayKey = [today.year, today.month, today.day];

  for (let i = 0; i < 3; i++) {
    if (birthKey[i] < todayKey[i]) break;
    if (birthKey[i] > todayKey[i]) {
      throw new Error("Birth date cannot be in the future.");
    }
  }

  let years = today.year - birth.year;
  let months = today.month - birth.month;
  let days = today.day - birth.day;

  if (days < 0) {
    let previousMonth = today.month - 1;
    let previousYear = today.year;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear -= 1;
    }

    days += daysInMonth(previousYear, previousMonth);
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
}

const form = document.getElementById("age-form");
const result = document.getElementById("result");
const status = document.getElementById("status");
const clearButton = document.getElementById("clear-button");

form.addEventListener("submit", event => {
  event.preventDefault();

  try {
    const birth = readDate("birth", "date of birth");
    const today = readDate("today", "today's date");

    const age = calculateAge(birth, today);

    result.textContent =
      `${age.years} years, ${age.months} months, ${age.days} days`;
    result.classList.remove("error");
    status.textContent = "Age calculated successfully.";
    status.classList.remove("error");
  } catch (error) {
    result.textContent = "Please check the entered dates.";
    result.classList.add("error");
    status.textContent = error.message;
    status.classList.add("error");
  }
});

clearButton.addEventListener("click", () => {
  form.reset();
  result.textContent = "Enter both dates to calculate your age";
  result.classList.remove("error");
  status.textContent = "Use the Jalali calendar (YYYY / MM / DD).";
  status.classList.remove("error");
});
