
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

function formatDate(date) {
  if (!date) return "Not set";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  const loadBookings = useCallback(() => {
    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.replace("/signin?next=%2Fbookings");
      return;
    }

    if (
      !session.roles?.includes("renter") &&
      !session.roles?.includes("admin")
    ) {
      router.replace("/dashboard");
      return;
    }

    const allBookings = getBookings();
    const allCars = getCars();

    setBookings(
      allBookings.filter(
        (booking) => booking.renterId === session.userId
      )
    );
    setCars(allCars);
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  function getCarName(carId) {
    const car = cars.find((item) => item.id === carId);
    return car ? `${car.make} ${car.model}` : "Car listing";
  }

  function exportBookings() {
    const headers = [
      "Booking reference",
      "Car",
      "Pickup date",
      "Return date",
      "Status",
      "Total ETB",
    ];

    const rows = filteredBookings.map((booking) => [
      booking.id,
      getCarName(booking.carId),
      booking.startDate,
      booking.endDate,
      statusLabels[booking.status] || booking.status,
      Number(booking.totalPrice || 0),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sheggar-wheels-bookings.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function cancelBooking(booking) {
    setMessage("");

    if (booking.status !== "requested") {
      setMessage("Only bookings awaiting owner confirmation can be cancelled here.");
      return;
    }

    const session = readStorage(SESSION_KEY, null);

    if (!session || session.userId !== booking.renterId) {
      setMessage("Please sign in to the account that made this booking.");
      return;
    }

    const updatedBooking = {
      ...booking,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    if (!saveBooking(updatedBooking)) {
      setMessage("We couldn't save the cancellation. Please try again.");
      return;
    }

    setBookings((current) =>
      current.map((item) =>
        item.id === booking.id ? updatedBooking : item
      )
    );

    setMessage(`Booking ${booking.id} has been cancelled.`);
  }

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  if (!loaded) {
    return <main className="dashboard-page">Loading your bookings...</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <Link href="/dashboard" className="text-link">
          ← Back to dashboard
        </Link>

        <span className="section-label">YOUR TRIPS</span>
        <h1>My bookings</h1>
        <p className="auth-description">
          Review your rental requests and keep track of your journeys.
        </p>

        <section className="dashboard-panel">
          <label className="catalogue-field">
            Filter bookings
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All bookings</option>
              <option value="requested">Awaiting confirmation</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Under dispute</option>
              <option value="resolved">Dispute resolved</option>
            </select>
          </label>

          <button
            type="button"
            className="gold-button"
            onClick={exportBookings}
            disabled={filteredBookings.length === 0}
          >
            Export filtered bookings to CSV
          </button>
        </section>

        {message && (
          <p role="status" className="detail-notice">
            {message}
          </p>
        )}

        {filteredBookings.length === 0 ? (
          <section className="dashboard-panel">
            <h2>
              {bookings.length === 0
                ? "No bookings yet"
                : "No bookings match this filter"}
            </h2>
            <p>
              {bookings.length === 0
                ? "Your car-rental trips will appear here after you book a car."
                : "Choose another status to see your other bookings."}
            </p>
            <Link href="/cars" className="gold-button">
              Explore cars
            </Link>
          </section>
        ) : (
          <div className="booking-list">
            {filteredBookings.map((booking) => (
              <article className="dashboard-panel" key={booking.id}>
                <div className="booking-card-heading">
                  <div>
                    <h2>{getCarName(booking.carId)}</h2>
                    <p>Booking reference: {booking.id}</p>
                  </div>
                  <span className="status-badge">
                    {statusLabels[booking.status] || booking.status}
                  </span>
                </div>

                <div className="booking-details">
                  <p>
                    <strong>Pickup:</strong>
                    {formatDate(booking.startDate)}
                  </p>
                  <p>
                    <strong>Return:</strong>
                    {formatDate(booking.endDate)}
                  </p>
                  <p>
                    <strong>Total:</strong>
                    ETB {Number(booking.totalPrice || 0).toLocaleString()}
                  </p>
                </div>

                <div className="booking-card-actions">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="text-link"
                  >
                    View booking details →
                  </Link>

                  {booking.status === "requested" && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => cancelBooking(booking)}
                    >
                      Cancel booking
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <Link href="/cars" className="text-link">
          Browse more cars →
        </Link>
      </div>
    </main>
  );
}
