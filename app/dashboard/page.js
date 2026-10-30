
"use client";

import { useEffect, useState } from "react";
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

function formatDate(value) {
  if (!value) return "Date not set";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentSession = readStorage(SESSION_KEY, null);

    if (!currentSession) {
      router.replace("/signin?next=%2Fdashboard");
      return;
    }

    if (!currentSession.roles?.includes("renter")) {
      router.replace(
        currentSession.roles?.includes("admin") ? "/admin" : "/owner"
      );
      return;
    }

    const allBookings = getBookings();
    const allCars = getCars();

    setSession(currentSession);
    setBookings(
      allBookings.filter(
        (booking) => booking.renterId === currentSession.userId
      )
    );
    setCars(allCars);
    setReady(true);
  }, [router]);

  function cancelBooking(booking) {
    if (!session || booking.renterId !== session.userId) {
      alert("You can only cancel your own bookings.");
      return;
    }

    if (!["requested", "confirmed"].includes(booking.status)) {
      alert("This booking can no longer be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    const updatedBooking = {
      ...booking,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    };

    const saved = saveBooking(updatedBooking);

    if (!saved) {
      alert("The booking could not be cancelled. Please try again.");
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.map((item) =>
        item.id === booking.id ? updatedBooking : item
      )
    );
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    router.replace("/signin");
  }

  if (!ready) {
    return (
      <main className="dashboard-page">
        <p className="detail-message">Loading your dashboard...</p>
      </main>
    );
  }

  const activeBookings = bookings.filter((booking) =>
    ["requested", "confirmed", "in_progress"].includes(booking.status)
  );

  const completedBookings = bookings.filter((booking) =>
    ["completed", "reviewed"].includes(booking.status)
  );

  return (
    <main className="dashboard-page">
      <header className="navbar dashboard-navbar">
        <Link href="/" className="brand">
          SHEGGAR<span>WHEELS</span>
          <span className="brand-dot">.</span>
        </Link>

        <nav className="nav-links">
          <Link href="/cars">Explore cars</Link>
          <Link href="/bookings">My bookings</Link>
        </nav>

        <button type="button" className="sign-out-button" onClick={signOut}>
          Sign out
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <span className="section-label">RENTER DASHBOARD</span>
            <h1>Welcome back, {session.name.split(" ")[0]}.</h1>
            <p>Here is what's happening with your journeys.</p>
          </div>

          <Link href="/cars" className="gold-button">
            Find a car <span>↗</span>
          </Link>
        </div>

        <div className="dashboard-demo-note">
          DEMO DATA · Your bookings are stored in this browser.
        </div>

        <section className="dashboard-stats">
          <article className="dashboard-stat">
            <span>Active bookings</span>
            <strong>{activeBookings.length}</strong>
            <p>Requested, confirmed, or in progress</p>
          </article>

          <article className="dashboard-stat">
            <span>Completed trips</span>
            <strong>{completedBookings.length}</strong>
            <p>Your finished rental journeys</p>
          </article>

          <article className="dashboard-stat">
            <span>Total bookings</span>
            <strong>{bookings.length}</strong>
            <p>Including cancelled and declined requests</p>
          </article>
        </section>

        <section className="dashboard-bookings">
          <div className="dashboard-section-heading">
            <div>
              <span className="section-label">YOUR ACTIVITY</span>
              <h2>Recent bookings</h2>
            </div>

            <Link href="/bookings" className="text-link">
              View all ↗
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon">↗</div>
              <h3>Your next journey starts here.</h3>
              <p>
                You haven't made any bookings yet. Explore the available cars
                and find one that fits your plans.
              </p>
              <Link href="/cars" className="gold-button">
                Browse cars
              </Link>
            </div>
          ) : (
            <div className="booking-list">
              {bookings.slice(0, 5).map((booking) => {
                const car = cars.find((item) => item.id === booking.carId);
                const canCancel = ["requested", "confirmed"].includes(
                  booking.status
                );

                return (
                  <article className="booking-row" key={booking.id}>
                    <div className="booking-car-image">
                      {car?.photos?.[0] ? (
                        <img
                          src={car.photos[0]}
                          alt={`${car.make} ${car.model}`}
                        />
                      ) : (
                        <span>SW</span>
                      )}
                    </div>

                    <div className="booking-car-info">
                      <h3>
                        {car ? `${car.make} ${car.model}` : "Car listing"}
                      </h3>
                      <p>
                        {formatDate(booking.startDate)} –{" "}
                        {formatDate(booking.endDate)}
                      </p>
                      <span
                        className={`booking-status status-${booking.status}`}
                      >
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>

                    <div className="booking-row-price">
                      <strong>
                        {Number(booking.totalPrice || 0).toLocaleString("en-US")}{" "}
                        ETB
                      </strong>
                      <span>Estimated total</span>
                    </div>

                    <div className="booking-row-actions">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="booking-view-link"
                      >
                        View ↗
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          className="cancel-booking-button"
                          onClick={() => cancelBooking(booking)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-explore">
          <div>
            <span className="section-label">MADE FOR YOUR NEXT TRIP</span>
            <h2>Something new is waiting.</h2>
            <p>Compare vehicles, prices, and locations around Addis Ababa.</p>
          </div>

          <Link href="/cars" className="gold-button">
            Explore the collection <span>↗</span>
          </Link>
        </section>
      </section>
    </main>
  );
}
