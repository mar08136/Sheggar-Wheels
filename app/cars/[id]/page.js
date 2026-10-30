
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getBookings,
  getCars,
  readStorage,
  SESSION_KEY,
  writeStorage,
} from "@/lib/storage";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function countRentalDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.round((end - start) / 86400000);
}

function CarDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const selectedCar = getCars().find(
      (item) => item.id === params.id && item.status === "approved"
    );

    setCar(selectedCar || null);
    setLoaded(true);
  }, [params.id]);

  function continueToCheckout(event) {
    event.preventDefault();
    setMessage("");

    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.push(`/signin?next=${encodeURIComponent(`/cars/${params.id}`)}`);
      return;
    }

    if (!session.roles?.includes("renter")) {
      setMessage("A renter account is required to book a car.");
      return;
    }

    if (!startDate || !endDate) {
      setMessage("Choose both pickup and return dates.");
      return;
    }

    if (startDate < getToday()) {
      setMessage("Pickup date cannot be in the past.");
      return;
    }

    const totalDays = countRentalDays(startDate, endDate);

    if (totalDays <= 0) {
      setMessage("Return date must be after pickup date.");
      return;
    }

    const bookings = getBookings();
    const activeStatuses = ["requested", "confirmed", "in_progress"];

    const hasConflict = bookings.some((booking) => {
      if (booking.carId !== car.id) return false;
      if (!activeStatuses.includes(booking.status)) return false;

      return startDate < booking.endDate && endDate > booking.startDate;
    });

    const hasUnavailableDate = (car.unavailableDates || []).some((date) => {
      return date >= startDate && date < endDate;
    });

    if (hasConflict || hasUnavailableDate) {
      setMessage("This car is unavailable for some of those dates. Choose another range.");
      return;
    }

    const draft = {
      carId: car.id,
      renterId: session.userId,
      ownerId: car.ownerId,
      startDate,
      endDate,
      totalDays,
      pricePerDay: Number(car.pricePerDay),
      totalPrice: totalDays * Number(car.pricePerDay),
      createdAt: new Date().toISOString(),
    };

    if (!writeStorage("sw_checkout_draft_v1", draft)) {
      setMessage("We couldn't save your booking details in this browser.");
      return;
    }

    router.push("/checkout");
  }

  if (!loaded) {
    return (
      <main className="catalogue-page">
        <p className="detail-message">Loading car details...</p>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="catalogue-page">
        <section className="detail-message">
          <h1>Car not found</h1>
          <p>This listing may not exist or may not be approved yet.</p>
          <Link href="/cars" className="gold-button">
            Browse available cars
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="catalogue-page">
      <header className="navbar">
        <Link href="/" className="brand">
          SHEGGAR<span>WHEELS</span>
          <span className="brand-dot">.</span>
        </Link>

        <nav className="nav-links">
          <Link href="/cars">Explore cars</Link>
          <Link href="/#how-it-works">How it works</Link>
        </nav>

        <div className="nav-actions">
          <Link href="/signin" className="sign-in">
            Sign in
          </Link>
          <Link href="/signup" className="nav-button">
            Get started <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="car-detail-page">
        <Link href="/cars" className="detail-back">
          ← Back to all cars
        </Link>

        <div className="detail-grid">
          <div className="detail-image">
            <img
              src={car.photos?.[0]}
              alt={`${car.year} ${car.make} ${car.model}`}
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
            <span className="car-tag">{car.neighbourhood}</span>
          </div>

          <div className="detail-info">
            <span className="section-label">
              {car.city} · DEMO LISTING
            </span>

            <h1>
              {car.make} {car.model}
            </h1>

            <p className="detail-description">{car.description}</p>

            <div className="detail-price">
              <strong>
                {Number(car.pricePerDay).toLocaleString("en-US")} ETB
              </strong>
              <span>per day</span>
            </div>

            <div className="detail-spec-grid">
              <div>
                <span>YEAR</span>
                <strong>{car.year}</strong>
              </div>
              <div>
                <span>TRANSMISSION</span>
                <strong>{car.transmission}</strong>
              </div>
              <div>
                <span>SEATS</span>
                <strong>{car.seats} people</strong>
              </div>
              <div>
                <span>LOCATION</span>
                <strong>{car.neighbourhood}</strong>
              </div>
            </div>

            <div className="detail-notice">
              Select your rental dates to check availability and calculate
              your estimated cost. No real payment will be taken.
            </div>

            <form className="auth-form" onSubmit={continueToCheckout}>
              <label className="catalogue-field">
                Pickup date
                <input
                  type="date"
                  value={startDate}
                  min={getToday()}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
              </label>

              <label className="catalogue-field">
                Return date
                <input
                  type="date"
                  value={endDate}
                  min={startDate || getToday()}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </label>

              {startDate && endDate && countRentalDays(startDate, endDate) > 0 && (
                <div className="detail-notice">
                  {countRentalDays(startDate, endDate)} days · Estimated total:{" "}
                  {(
                    countRentalDays(startDate, endDate) *
                    Number(car.pricePerDay)
                  ).toLocaleString("en-US")}{" "}
                  ETB
                </div>
              )}

              {message && (
                <p className="auth-error" role="alert">
                  {message}
                </p>
              )}

              <button type="submit" className="gold-button detail-cta">
                Continue to checkout <span>↗</span>
              </button>
            </form>

            <p className="detail-footnote">
              This is a frontend demo. No real reservation or payment is made.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CarDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="catalogue-page">
          <p className="detail-message">Loading car details...</p>
        </main>
      }
    >
      <CarDetailsContent />
    </Suspense>
  );
}
