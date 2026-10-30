
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCars,
  readStorage,
  SESSION_KEY,
} from "@/lib/storage";

export default function OwnerCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadCars = useCallback(() => {
    const session = readStorage(SESSION_KEY, null);

    if (!session) {
      router.replace("/signin?next=%2Fowner%2Fcars");
      return;
    }

    if (!session.roles?.includes("owner")) {
      router.replace("/dashboard");
      return;
    }

    setCars(
      getCars().filter((car) => car.ownerId === session.userId)
    );
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  if (!loaded) {
    return <main className="dashboard-page">Loading your listings...</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <Link href="/owner" className="text-link">
          ← Owner dashboard
        </Link>

        <span className="section-label">OWNER PORTAL</span>
        <h1>My car listings</h1>
        <p className="auth-description">
          Manage the vehicles you have listed on Sheggar Wheels.
        </p>

        <div className="booking-card-actions">
          <Link href="/owner/cars/new" className="gold-button">
            Add a car
          </Link>
          <Link href="/owner" className="text-link">
            Back to overview
          </Link>
        </div>

        {cars.length === 0 ? (
          <section className="dashboard-panel">
            <h2>No listings yet</h2>
            <p>Add your first vehicle to get started.</p>
            <Link href="/owner/cars/new" className="gold-button">
              Add your first car
            </Link>
          </section>
        ) : (
          <div className="booking-list">
            {cars.map((car) => (
              <article key={car.id} className="dashboard-panel">
                {car.photos?.[0] && (
                  <img
                    src={car.photos[0]}
                    alt={`${car.make} ${car.model}`}
                    className="booking-car-image"
                  />
                )}

                <div className="booking-card-heading">
                  <div>
                    <h2>
                      {car.year} {car.make} {car.model}
                    </h2>
                    <p>
                      {car.city || "Location not set"}
                      {car.neighbourhood ? `, ${car.neighbourhood}` : ""}
                    </p>
                  </div>
                  <span className="status-badge">
                    {car.status || "Unknown"}
                  </span>
                </div>

                <p>
                  <strong>Price:</strong> ETB{" "}
                  {Number(car.pricePerDay || 0).toLocaleString()} per day
                </p>

                <p>
                  <strong>Transmission:</strong>{" "}
                  {car.transmission || "Not specified"}
                </p>

                <p>
                  <strong>Seats:</strong> {car.seats || "Not specified"}
                </p>

                <div className="booking-card-actions">
                  <Link
                    href={`/owner/cars/${car.id}/edit`}
                    className="text-link"
                  >
                    Edit listing
                  </Link>
                  <Link
                    href={`/owner/cars/${car.id}/availability`}
                    className="text-link"
                  >
                    Manage availability
                  </Link>
                  <Link
                    href={`/owner/cars/${car.id}/bookings`}
                    className="text-link"
                  >
                    View requests
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
