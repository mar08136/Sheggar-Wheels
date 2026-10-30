
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { readStorage, saveCar, SESSION_KEY } from "@/lib/storage";

const initialForm = {
  make: "",
  model: "",
  year: "",
  transmission: "Automatic",
  seats: "5",
  city: "Addis Ababa",
  neighbourhood: "",
  pricePerDay: "",
  photo: "",
  description: "",
};

export default function NewOwnerCarPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.replace("/signin?next=%2Fowner%2Fcars%2Fnew");
      return;
    }

    if (!session.roles?.includes("owner")) {
      router.replace("/dashboard");
      return;
    }

    setLoaded(true);
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const session = readStorage(SESSION_KEY, null);

    if (!session || !session.roles?.includes("owner")) {
      router.replace("/signin?next=%2Fowner%2Fcars%2Fnew");
      return;
    }

    const year = Number(form.year);
    const seats = Number(form.seats);
    const pricePerDay = Number(form.pricePerDay);

    if (
      !form.make.trim() ||
      !form.model.trim() ||
      !form.neighbourhood.trim() ||
      !form.description.trim() ||
      !Number.isInteger(year) ||
      year < 1980 ||
      year > new Date().getFullYear() + 1 ||
      !Number.isInteger(seats) ||
      seats < 1 ||
      seats > 50 ||
      !Number.isFinite(pricePerDay) ||
      pricePerDay <= 0
    ) {
      setMessage("Please check all fields and enter valid vehicle details.");
      return;
    }

    if (form.photo.trim()) {
      try {
        const photoUrl = new URL(form.photo.trim());

        if (!["http:", "https:"].includes(photoUrl.protocol)) {
          setMessage("The photo must use a valid HTTP or HTTPS URL.");
          return;
        }
      } catch {
        setMessage("Please enter a valid photo URL or leave it empty.");
        return;
      }
    }

    setSaving(true);

    const car = {
      id: `car-${crypto.randomUUID()}`,
      ownerId: session.userId,
      make: form.make.trim(),
      model: form.model.trim(),
      year,
      transmission: form.transmission,
      seats,
      city: form.city.trim(),
      neighbourhood: form.neighbourhood.trim(),
      pricePerDay,
      photos: form.photo.trim() ? [form.photo.trim()] : [],
      description: form.description.trim(),
      status: "pending",
      unavailableDates: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = saveCar(car);

      if (saved === false) {
        setMessage("The listing could not be saved. Please try again.");
        setSaving(false);
        return;
      }

      router.push("/owner/cars");
    } catch {
      setMessage("The listing could not be saved. Please try again.");
      setSaving(false);
    }
  }

  if (!loaded) {
    return <main className="dashboard-page">Loading...</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <Link href="/owner/cars" className="text-link">
          ← Back to my listings
        </Link>

        <span className="section-label">OWNER PORTAL</span>
        <h1>Add a vehicle</h1>
        <p className="auth-description">
          Enter your vehicle details to submit a new listing for approval.
        </p>

        <form onSubmit={handleSubmit} className="dashboard-panel">
          <h2>Vehicle information</h2>

          <div className="catalogue-field">
            <label htmlFor="make">Car make</label>
            <input
              id="make"
              name="make"
              value={form.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="model">Car model</label>
            <input
              id="model"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Corolla"
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="year">Year</label>
            <input
              id="year"
              name="year"
              type="number"
              min="1980"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="transmission">Transmission</label>
            <select
              id="transmission"
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              required
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="catalogue-field">
            <label htmlFor="seats">Number of seats</label>
            <input
              id="seats"
              name="seats"
              type="number"
              min="1"
              max="50"
              value={form.seats}
              onChange={handleChange}
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="neighbourhood">Neighbourhood</label>
            <input
              id="neighbourhood"
              name="neighbourhood"
              value={form.neighbourhood}
              onChange={handleChange}
              placeholder="e.g. Bole"
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="pricePerDay">Price per day (ETB)</label>
            <input
              id="pricePerDay"
              name="pricePerDay"
              type="number"
              min="1"
              step="0.01"
              value={form.pricePerDay}
              onChange={handleChange}
              placeholder="e.g. 2500"
              required
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="photo">Vehicle photo URL (optional)</label>
            <input
              id="photo"
              name="photo"
              type="url"
              value={form.photo}
              onChange={handleChange}
              placeholder="https://example.com/car.jpg"
            />
          </div>

          <div className="catalogue-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the vehicle and its features."
              rows={5}
              required
            />
          </div>

          <p className="auth-description">
            New listings start as pending and must be approved before they can
            be rented.
          </p>

          {message && (
            <p role="alert" className="detail-notice">
              {message}
            </p>
          )}

          <div className="booking-card-actions">
            <button
              type="submit"
              className="gold-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Submit vehicle"}
            </button>

            <Link href="/owner/cars" className="text-link">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
