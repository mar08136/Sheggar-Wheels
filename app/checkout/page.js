
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
  writeStorage,
} from "@/lib/storage";

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-ET", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function countRentalDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  return Math.round((end - start) / 86400000);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [car, setCar] = useState(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.replace("/signin?next=%2Fcheckout");
      return;
    }

    if (!session.roles?.includes("renter")) {
      setMessage("A renter account is required to complete a booking.");
      setReady(true);
      return;
    }

    const savedDraft = readStorage("sw_checkout_draft_v1", null);

    if (!savedDraft) {
      setMessage("Your checkout details have expired or are missing.");
      setReady(true);
      return;
    }

    const selectedCar = getCars().find(
      (item) =>
        item.id === savedDraft.carId &&
        item.status === "approved" &&
        item.ownerId === savedDraft.ownerId
    );

    if (!selectedCar || savedDraft.renterId !== session.userId) {
      setMessage("We couldn't verify this car or booking.");
      setReady(true);
      return;
    }

    setDraft(savedDraft);
    setCar(selectedCar);
    setReady(true);
  }, [router]);

  function confirmBooking() {
    if (processing || !draft || !car) return;

    setProcessing(true);
    setMessage("");

    const session = readStorage(SESSION_KEY, null);
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const totalDays = countRentalDays(draft.startDate, draft.endDate);
    const pricePerDay = Number(car.pricePerDay);

    if (
      !session ||
      !session.roles?.includes("renter") ||
      session.userId !== draft.renterId
    ) {
      setProcessing(false);
      setMessage("Your session has changed. Please sign in again.");
      return;
    }

    if (
      !draft.startDate ||
      !draft.endDate ||
      draft.startDate < todayString ||
      totalDays <= 0 ||
      !Number.isFinite(pricePerDay) ||
      pricePerDay <= 0
    ) {
      setProcessing(false);
      setMessage("The rental dates or price are invalid. Please select your dates again.");
      return;
    }

    const bookings = getBookings();
    const activeStatuses = ["requested", "confirmed", "in_progress"];

    const hasConflict = bookings.some((booking) => {
      if (booking.carId !== car.id) return false;
      if (!activeStatuses.includes(booking.status)) return false;

      return (
        draft.startDate < booking.endDate &&
        draft.endDate > booking.startDate
      );
    });

    const hasUnavailableDate = (car.unavailableDates || []).some(
      (date) => date >= draft.startDate && date < draft.endDate
    );

    if (hasConflict || hasUnavailableDate) {
      setProcessing(false);
      setMessage("This car is no longer available for those dates. Please choose new dates.");
      return;
    }

    const bookingId = `booking-${Date.now()}`;

    const booking = {
      id: bookingId,
      carId: car.id,
      renterId: session.userId,
      ownerId: car.ownerId,
      startDate: draft.startDate,
      endDate: draft.endDate,
      totalDays,
      pricePerDay,
      totalPrice: totalDays * pricePerDay,
      status: "requested",
      paymentStatus: "demo",
      createdAt: new Date().toISOString(),
    };

    if (!saveBooking(booking)) {
      setProcessing(false);
      setMessage("We couldn't save your booking. Please try again.");
      return;
    }

    window.sessionStorage.removeItem("sw_checkout_draft_v1");
    router.push(`/bookings/${bookingId}`);
  }

  if (!ready) {
    return (
      <main className="car-detail-page">
        <p className="detail-message">Loading checkout...</p>
      </main>
    );
  }

  if (message && (!draft || !car)) {
    return (
      <main className="car-detail-page">
        <Link href="/cars" className="detail-back">
          ← Browse cars
        </Link>
        <section className="dashboard-panel">
          <h1>Checkout unavailable</h1>
          <p role="alert">{message}</p>
          <Link href="/cars" className="gold-button">
            Explore cars
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="car-detail-page booking-detail-page">
      <Link href={`/cars/${car.id}`} className="detail-back">
        ← Back to car details
      </Link>

      <span className="section-label">SECURE YOUR BOOKING</span>
      <h1>Review your rental</h1>
      <p className="detail-description">
        Check your details before submitting your booking request.
      </p>

      <section className="dashboard-panel booking-detail-panel">
        {car.photos?.[0] && (
          <div className="booking-detail-image">
            <img
              src={car.photos[0]}
              alt={`${car.make} ${car.model}`}
            />
          </div>
        )}

        <h2>
          {car.make} {car.model}
        </h2>

        <div className="booking-details">
          <p>
            <strong>Pickup</strong>
            {formatDate(draft.startDate)}
          </p>
          <p>
            <strong>Return</strong>
            {formatDate(draft.endDate)}
          </p>
          <p>
            <strong>Rental duration</strong>
            {countRentalDays(draft.startDate, draft.endDate)} days
          </p>
          <p>
            <strong>Price per day</strong>
            {Number(car.pricePerDay).toLocaleString("en-US")} ETB
          </p>
          <p>
            <strong>Total</strong>
            {(
              countRentalDays(draft.startDate, draft.endDate) *
              Number(car.pricePerDay)
            ).toLocaleString("en-US")} ETB
          </p>
        </div>

        <div className="booking-detail-notice">
          Demo payment only. No real money or payment details are collected.
          Your booking will be submitted as a request for the owner to confirm.
        </div>

        {message && (
          <p className="auth-error" role="alert">
            {message}
          </p>
        )}

        <button
          type="button"
          className="gold-button"
          onClick={confirmBooking}
          disabled={processing}
        >
          {processing ? "Submitting..." : "Confirm demo booking"}
        </button>
      </section>
    </main>
  );
}
