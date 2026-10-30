
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getBookings,
  getCars,
  readStorage,
  saveBooking,
  SESSION_KEY,
} from "@/lib/storage";

const statusLabels = {
  requested: "Awaiting confirmation",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  reviewed: "Reviewed",
  declined: "Declined",
  cancelled: "Cancelled",
  disputed: "Under dispute",
  resolved: "Dispute resolved",
};

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(() => {
    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.replace("/signin?next=%2Fowner");
      return;
    }

    if (!session.roles?.includes("owner")) {
      router.replace("/dashboard");
      return;
    }

    const ownerCars = getCars().filter(
      (car) => car.ownerId === session.userId
    );

    const ownerCarIds = new Set(ownerCars.map((car) => car.id));

    const ownerBookings = getBookings().filter(
      (booking) =>
        booking.ownerId === session.userId &&
        ownerCarIds.has(booking.carId)
    );

    setOwner(session);
    setCars(ownerCars);
    setBookings(ownerBookings);
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function updateBooking(booking, nextStatus) {
    setMessage("");

    const session = readStorage(SESSION_KEY, null);

    if (
      !session ||
      !session.roles?.includes("owner") ||
      session.userId !== booking.ownerId
    ) {
      setMessage("You are not allowed to update this booking.");
      return;
    }

    const ownedCar = getCars().find(
      (car) =>
        car.id === booking.carId &&
        car.ownerId === session.userId
    );

    if (!ownedCar || booking.status !== "requested") {
      setMessage("This booking can no longer be updated.");
      return;
    }

    if (!["confirmed", "declined"].includes(nextStatus)) {
      setMessage("Invalid booking status.");
      return;
    }

    const updatedBooking = {
      ...booking,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    if (!saveBooking(updatedBooking)) {
      setMessage("Could not save the booking update.");
      return;
    }

    setBookings((current) =>
      current.map((item) =>
        item.id === booking.id ? updatedBooking : item
      )
    );

    setMessage(
      nextStatus === "confirmed"
        ? "Rental request confirmed."
        : "Rental request declined."
    );
  }

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "requested"
  );

  const activeCars = cars.filter(
    (car) => car.status === "approved"
  );

  const totalEarnings = bookings
    .filter((booking) =>
      ["completed", "reviewed"].includes(booking.status)
    )
    .reduce(
      (total, booking) => total + Number(booking.totalPrice || 0),
      0
    );

  if (!loaded) {
    return (
      <main className="owner-shell">
        <div className="owner-loading">Loading your dashboard...</div>
      </main>
    );
  }

  return (
    <main className="owner-shell">
      <aside className="owner-sidebar">
        <Link href="/" className="owner-brand">
          <span className="owner-brand-mark">S</span>
          <span>
            <strong>SHEGGAR</strong>
            <small>WHEELS</small>
          </span>
        </Link>

        <div className="owner-profile">
          <div className="owner-avatar">
            {(owner?.name || owner?.fullName || "O").charAt(0).toUpperCase()}
          </div>
          <div className="owner-profile-copy">
            <strong>{owner?.name || owner?.fullName || "Car Owner"}</strong>
            <span>Vehicle owner</span>
          </div>
        </div>

        <span className="owner-nav-label">WORKSPACE</span>

        <nav className="owner-navigation">
          <Link href="/owner" className="owner-nav-link owner-nav-active">
            <span className="owner-nav-icon">⌂</span>
            Dashboard
          </Link>
          <Link href="/owner/cars" className="owner-nav-link">
            <span className="owner-nav-icon">▣</span>
            My vehicles
          </Link>
          <a href="#owner-bookings" className="owner-nav-link">
            <span className="owner-nav-icon">▤</span>
            Rental requests
            {pendingBookings.length > 0 && (
              <span className="owner-nav-count">{pendingBookings.length}</span>
            )}
          </a>
          <a href="#owner-earnings" className="owner-nav-link">
            <span className="owner-nav-icon">◈</span>
            Earnings
          </a>
        </nav>

        <div className="owner-sidebar-bottom">
          <div className="owner-help-card">
            <span className="owner-help-icon">✦</span>
            <strong>Grow your business</strong>
            <p>Keep your vehicle listings up to date to attract renters.</p>
            <Link href="/owner/cars/new">List a vehicle ↗</Link>
          </div>
          <Link href="/" className="owner-back-link">
            ← Back to website
          </Link>
        </div>
      </aside>

      <div className="owner-main">
        <header className="owner-topbar">
          <div>
            <span className="owner-breadcrumb">WORKSPACE / OVERVIEW</span>
            <p>Owner control center</p>
          </div>
          <div className="owner-topbar-actions">
            <span className="owner-account-status">
              <span />
              Demo account
            </span>
            <Link href="/owner/cars/new" className="owner-primary-button">
              <span>＋</span> Add vehicle
            </Link>
          </div>
        </header>

        <div className="owner-content">
          <section className="owner-hero">
            <div>
              <span className="owner-eyebrow">YOUR BUSINESS AT A GLANCE</span>
              <h1>
                Welcome back
                <br />
                <span>{owner?.name || owner?.fullName || "Owner"}.</span>
              </h1>
              <p>
                Manage your fleet, review rental requests, and keep your
                business moving.
              </p>
            </div>
            <div className="owner-hero-decoration" aria-hidden="true">
              <span className="owner-hero-ring owner-hero-ring-one" />
              <span className="owner-hero-ring owner-hero-ring-two" />
              <span className="owner-hero-monogram">SW</span>
              <span className="owner-hero-caption">DRIVE YOUR BUSINESS</span>
            </div>
          </section>

          {message && (
            <div className="owner-feedback" role="status">
              <span>✓</span>
              {message}
            </div>
          )}

          <section className="owner-stats" aria-label="Business overview">
            <article className="owner-stat-card">
              <div className="owner-stat-top">
                <span className="owner-stat-icon">▣</span>
                <span className="owner-stat-tag">FLEET</span>
              </div>
              <span className="owner-stat-label">Total vehicles</span>
              <strong>{cars.length}</strong>
              <p>{activeCars.length} approved and listed</p>
              <Link href="/owner/cars">Manage fleet ↗</Link>
            </article>

            <article className="owner-stat-card owner-stat-highlight">
              <div className="owner-stat-top">
                <span className="owner-stat-icon">▤</span>
                <span className="owner-stat-tag">
                  {pendingBookings.length ? "ACTION NEEDED" : "UP TO DATE"}
                </span>
              </div>
              <span className="owner-stat-label">Pending requests</span>
              <strong>{pendingBookings.length}</strong>
              <p>
                {pendingBookings.length
                  ? "Requests waiting for your decision"
                  : "No requests waiting for approval"}
              </p>
              <a href="#owner-bookings">Review requests ↓</a>
            </article>

            <article className="owner-stat-card" id="owner-earnings">
              <div className="owner-stat-top">
                <span className="owner-stat-icon">◈</span>
                <span className="owner-stat-tag">COMPLETED TRIPS</span>
              </div>
              <span className="owner-stat-label">Completed rental value</span>
              <strong className="owner-earnings-value">
                <span>ETB</span> {totalEarnings.toLocaleString()}
              </strong>
              <p>Before platform commission</p>
              <span className="owner-stat-footnote">Based on completed rentals</span>
            </article>
          </section>

          <section className="owner-section" id="owner-vehicles">
            <div className="owner-section-heading">
              <div>
                <span className="owner-eyebrow">YOUR FLEET</span>
                <h2>Vehicle management</h2>
                <p>Keep track of the cars you have listed.</p>
              </div>
              <Link href="/owner/cars" className="owner-secondary-button">
                View all vehicles <span>↗</span>
              </Link>
            </div>

            {cars.length === 0 ? (
              <div className="owner-empty-state">
                <span className="owner-empty-icon">＋</span>
                <h3>Your fleet starts here</h3>
                <p>
                  Add your first vehicle to start building your rental
                  business on Sheggar Wheels.
                </p>
                <Link href="/owner/cars/new" className="owner-primary-button">
                  Add your first vehicle
                </Link>
              </div>
            ) : (
              <div className="owner-vehicle-grid">
                {cars.slice(0, 3).map((car) => (
                  <article className="owner-vehicle-card" key={car.id}>
                    <div className="owner-vehicle-image">
                      {car.photos?.[0] ? (
                        <img
                          src={car.photos[0]}
                          alt={`${car.make} ${car.model}`}
                        />
                      ) : (
                        <span className="owner-car-placeholder">SW</span>
                      )}
                      <span
                        className={`owner-vehicle-status owner-status-${car.status || "unknown"}`}
                      >
                        <span />
                        {car.status || "Unknown"}
                      </span>
                    </div>
                    <div className="owner-vehicle-body">
                      <span className="owner-vehicle-year">
                        {car.year || "YEAR N/A"} · {car.transmission || "Transmission N/A"}
                      </span>
                      <h3>{car.make} {car.model}</h3>
                      <p className="owner-vehicle-location">
                        <span>⌖</span> {car.city || "Location not set"}
                        {car.neighbourhood ? `, ${car.neighbourhood}` : ""}
                      </p>
                      <div className="owner-vehicle-footer">
                        <div>
                          <strong>
                            ETB {Number(car.pricePerDay || 0).toLocaleString()}
                          </strong>
                          <span>per day</span>
                        </div>
                        <Link
                          href={`/owner/cars/${car.id}/edit`}
                          aria-label={`Edit ${car.make} ${car.model}`}
                        >
                          Edit ↗
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {cars.length > 3 && (
              <Link href="/owner/cars" className="owner-more-link">
                View all {cars.length} vehicles →
              </Link>
            )}
          </section>

          <section className="owner-section" id="owner-bookings">
            <div className="owner-section-heading">
              <div>
                <span className="owner-eyebrow">BOOKING ACTIVITY</span>
                <h2>Rental requests</h2>
                <p>Review requests and manage upcoming rentals.</p>
              </div>
              <span className="owner-section-count">
                {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="owner-empty-state owner-booking-empty">
                <span className="owner-empty-icon">▤</span>
                <h3>No rental requests yet</h3>
                <p>
                  When renters book one of your approved vehicles, their
                  requests will appear here.
                </p>
                <Link href="/owner/cars" className="owner-secondary-button">
                  Check your listings ↗
                </Link>
              </div>
            ) : (
              <div className="owner-booking-list">
                {bookings.map((booking) => {
                  const car = cars.find((item) => item.id === booking.carId);

                  return (
                    <article className="owner-booking-card" key={booking.id}>
                      <div className="owner-booking-car-mark">SW</div>
                      <div className="owner-booking-main">
                        <h3>
                          {car ? `${car.make} ${car.model}` : "Car listing"}
                        </h3>
                        <p>Ref. {booking.id}</p>
                        <div className="owner-booking-dates">
                          <span>
                            <small>PICKUP</small>
                            {booking.startDate}
                          </span>
                          <span>
                            <small>RETURN</small>
                            {booking.endDate}
                          </span>
                        </div>
                      </div>
                      <div className="owner-booking-total">
                        <span>BOOKING TOTAL</span>
                        <strong>
                          ETB {Number(booking.totalPrice || 0).toLocaleString()}
                        </strong>
                        <span
                          className={`owner-booking-status owner-booking-status-${booking.status}`}
                        >
                          {statusLabels[booking.status] || booking.status}
                        </span>
                      </div>
                      {booking.status === "requested" && (
                        <div className="owner-booking-actions">
                          <button
                            type="button"
                            className="owner-confirm-button"
                            onClick={() => updateBooking(booking, "confirmed")}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="owner-decline-button"
                            onClick={() => updateBooking(booking, "declined")}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="owner-footer">
            <span>© SHEGGAR WHEELS</span>
            <span>PREMIUM CAR RENTALS · ADDIS ABABA</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
