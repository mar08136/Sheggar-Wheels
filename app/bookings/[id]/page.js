
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBookings, getCars, readStorage, SESSION_KEY } from "@/lib/storage";

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

function BookingDetailsContent() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.replace(`/signin?next=${encodeURIComponent(`/bookings/${id}`)}`);
      return;
    }

    const foundBooking = getBookings().find((item) => item.id === id);

    if (!foundBooking) {
      setMessage("We couldn't find this booking.");
      setReady(true);
      return;
    }

    const isAdmin = session.roles?.includes("admin");
    const isRenter = foundBooking.renterId === session.userId;

    if (!isAdmin && !isRenter) {
      setMessage("You don't have permission to view this booking.");
      setReady(true);
      return;
    }

    const foundCar = getCars().find((item) => item.id === foundBooking.carId);

    setBooking(foundBooking);
    setCar(foundCar || null);
    setReady(true);
  }, [id, router]);

  if (!ready) {
    return (
      <main className="car-detail-page">
        <p className="detail-message">Loading booking details...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="car-detail-page booking-detail-page">
        <Link href="/bookings" className="detail-back">
          ← My bookings
        </Link>
        <section className="dashboard-panel">
          <h2>Booking unavailable</h2>
          <p>{message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="car-detail-page booking-detail-page">
      <Link href="/bookings" className="detail-back">
        ← Back to my bookings
      </Link>

      <span className="section-label">BOOKING DETAILS</span>
      <h1 className="booking-detail-title">
        {car ? `${car.make} ${car.model}` : "Your booking"}
      </h1>

      <p className="detail-description">
        Review your rental dates, booking status, and estimated cost.
      </p>

      {car?.photos?.[0] && (
        <div className="booking-detail-image">
          <img src={car.photos[0]} alt={`${car.make} ${car.model}`} />
        </div>
      )}

      <section className="dashboard-panel booking-detail-panel">
        <div className="booking-card-heading">
          <div>
            <h2>Booking summary</h2>
            <p>Reference: {booking.id}</p>
          </div>
          <span className="status-badge">
            {statusLabels[booking.status] || booking.status}
          </span>
        </div>

        <div className="booking-details">
          <p>
            <strong>Pickup date</strong>
            {formatDate(booking.startDate)}
          </p>
          <p>
            <strong>Return date</strong>
            {formatDate(booking.endDate)}
          </p>
          <p>
            <strong>Estimated total</strong>
            {Number(booking.totalPrice || 0).toLocaleString("en-US")} ETB
          </p>
        </div>

        <p className="booking-detail-notice">
          This is a frontend demo. No real payment has been made.
        </p>

        <Link href="/cars" className="gold-button">
          Explore more cars ↗
        </Link>
      </section>
    </main>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="car-detail-page">
          <p className="detail-message">Loading booking details...</p>
        </main>
      }
    >
      <BookingDetailsContent />
    </Suspense>
  );
}
