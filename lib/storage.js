
import {
  demoUsers,
  demoCars,
  demoBookings,
  demoReviews,
  demoDisputes,
  demoAnnouncements,
} from "./seed-data";

export const STORAGE_KEYS = {
  users: "sw_users_v1",
  cars: "sw_cars_v1",
  bookings: "sw_bookings_v1",
  reviews: "sw_reviews_v1",
  disputes: "sw_disputes_v1",
  announcements: "sw_announcements_v1",
};

export const SESSION_KEY = "sw_session_v1";


export function readStorage(key, fallback = null) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const storage =
      key === SESSION_KEY || key === "sw_checkout_draft_v1"
        ? window.sessionStorage
        : window.localStorage;

    const savedValue = storage.getItem(key);

    if (savedValue === null) {
      return fallback;
    }

    return JSON.parse(savedValue);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const storage =
      key === SESSION_KEY || key === "sw_checkout_draft_v1"
        ? window.sessionStorage
        : window.localStorage;

    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}


export function initializeDemoData() {
  if (typeof window === "undefined") {
    return false;
  }

  const seedEntries = [
    [STORAGE_KEYS.users, demoUsers],
    [STORAGE_KEYS.cars, demoCars],
    [STORAGE_KEYS.bookings, demoBookings],
    [STORAGE_KEYS.reviews, demoReviews],
    [STORAGE_KEYS.disputes, demoDisputes],
    [STORAGE_KEYS.announcements, demoAnnouncements],
  ];

  let success = true;

  for (const [key, data] of seedEntries) {
    try {
      if (window.localStorage.getItem(key) === null) {
        const saved = writeStorage(key, data);

        if (!saved) {
          success = false;
        }
      }
    } catch {
      success = false;
    }
  }

  return success;
}

export function resetDemoData() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    for (const key of Object.values(STORAGE_KEYS)) {
      window.localStorage.removeItem(key);
    }

    window.sessionStorage.removeItem(SESSION_KEY);

    return initializeDemoData();
  } catch {
    return false;
  }
}

export function getCars() {
  return readStorage(STORAGE_KEYS.cars, []);
}

export function getBookings() {
  return readStorage(STORAGE_KEYS.bookings, []);
}

export function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

export function getReviews() {
  return readStorage(STORAGE_KEYS.reviews, []);
}

export function getDisputes() {
  return readStorage(STORAGE_KEYS.disputes, []);
}

export function getAnnouncements() {
  return readStorage(STORAGE_KEYS.announcements, []);
}

function saveRecord(key, record) {
  if (!record || !record.id) {
    return false;
  }

  const records = readStorage(key, []);

  if (!Array.isArray(records)) {
    return false;
  }

  const existingIndex = records.findIndex(
    (item) => item.id === record.id
  );

  const updatedRecords = [...records];

  if (existingIndex === -1) {
    updatedRecords.push(record);
  } else {
    updatedRecords[existingIndex] = record;
  }

  return writeStorage(key, updatedRecords);
}

export function saveCar(car) {
  return saveRecord(STORAGE_KEYS.cars, car);
}

export function saveBooking(booking) {
  return saveRecord(STORAGE_KEYS.bookings, booking);
}

export function saveUser(user) {
  return saveRecord(STORAGE_KEYS.users, user);
}

export function saveReview(review) {
  return saveRecord(STORAGE_KEYS.reviews, review);
}

export function saveDispute(dispute) {
  return saveRecord(STORAGE_KEYS.disputes, dispute);
}

export function saveAnnouncement(announcement) {
  return saveRecord(STORAGE_KEYS.announcements, announcement);
}
