
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCars } from "@/lib/storage";

const PAGE_SIZE = 6;

function CarsContent() {
  const searchParams = useSearchParams();

  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [transmission, setTransmission] = useState("");
  const [seats, setSeats] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCars(getCars());

    const location = searchParams.get("location");

    if (location && location !== "all") {
      setNeighbourhood(location);
    }
  }, [searchParams]);

  const neighbourhoods = useMemo(
    () =>
      [...new Set(cars.map((car) => car.neighbourhood))].sort(),
    [cars]
  );

  const filteredCars = useMemo(() => {
    const result = cars.filter((car) => {
      const searchText =
        `${car.make} ${car.model} ${car.description || ""}`.toLowerCase();

      return (
        searchText.includes(search.toLowerCase()) &&
        (!neighbourhood || car.neighbourhood === neighbourhood) &&
        (minPrice === "" || car.pricePerDay >= Number(minPrice)) &&
        (maxPrice === "" || car.pricePerDay <= Number(maxPrice)) &&
        (!transmission || car.transmission === transmission) &&
        (!seats || car.seats >= Number(seats)) &&
        car.status === "approved"
      );
    });

    if (sort === "price-asc") {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.pricePerDay - a.pricePerDay);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [
    cars,
    search,
    neighbourhood,
    minPrice,
    maxPrice,
    transmission,
    seats,
    sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCars.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleCars = filteredCars.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function resetFilters() {
    setSearch("");
    setNeighbourhood("");
    setMinPrice("");
    setMaxPrice("");
    setTransmission("");
    setSeats("");
    setSort("newest");
    setPage(1);
  }

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <main className="catalogue-page">
      <header className="navbar">
        <Link href="/" className="brand">
          SHEGGAR<span>WHEELS</span>
          <span className="brand-dot">.</span>
        </Link>

        <nav className="nav-links">
          <Link href="/#cars">Featured cars</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#owners">For owners</Link>
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

      <section className="catalogue-header">
        <span className="section-label">THE SHEGGAR COLLECTION</span>
        <h1>Find your next drive.</h1>
        <p>
          Explore sample vehicles listed around Addis Ababa.
          Filter the collection to find your fit.
        </p>
        <span className="demo-note">DEMO DATA · SAMPLE LISTINGS</span>
      </section>

      <section className="catalogue-layout">
        <aside className="filter-panel">
          <div className="filter-heading">
            <h2>Filters</h2>
            <button type="button" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <label className="catalogue-field">
            Search
            <input
              type="search"
              placeholder="Make or model..."
              value={search}
              onChange={(event) =>
                updateFilter(setSearch, event.target.value)
              }
            />
          </label>

          <label className="catalogue-field">
            Neighbourhood
            <select
              value={neighbourhood}
              onChange={(event) =>
                updateFilter(setNeighbourhood, event.target.value)
              }
            >
              <option value="">All neighbourhoods</option>
              {neighbourhoods.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </label>

          <div className="price-filter">
            <label className="catalogue-field">
              Minimum price (ETB)
              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(event) =>
                  updateFilter(setMinPrice, event.target.value)
                }
              />
            </label>

            <label className="catalogue-field">
              Maximum price (ETB)
              <input
                type="number"
                min="0"
                placeholder="No limit"
                value={maxPrice}
                onChange={(event) =>
                  updateFilter(setMaxPrice, event.target.value)
                }
              />
            </label>
          </div>

          <label className="catalogue-field">
            Transmission
            <select
              value={transmission}
              onChange={(event) =>
                updateFilter(setTransmission, event.target.value)
              }
            >
              <option value="">All types</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </label>

          <label className="catalogue-field">
            Minimum seats
            <select
              value={seats}
              onChange={(event) =>
                updateFilter(setSeats, event.target.value)
              }
            >
              <option value="">Any number</option>
              <option value="2">2+ seats</option>
              <option value="5">5+ seats</option>
              <option value="7">7+ seats</option>
            </select>
          </label>
        </aside>

        <div className="catalogue-results">
          <div className="results-toolbar">
            <p>
              <strong>{filteredCars.length}</strong>{" "}
              {filteredCars.length === 1 ? "car" : "cars"} found
            </p>

            <label className="sort-field">
              Sort by
              <select
                value={sort}
                onChange={(event) =>
                  updateFilter(setSort, event.target.value)
                }
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          {visibleCars.length > 0 ? (
            <div className="car-grid catalogue-grid">
              {visibleCars.map((car) => (
                <article className="car-card" key={car.id}>
                  <div className="car-image-wrap">
                    <img
                      src={car.photos?.[0]}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <span className="car-tag">{car.neighbourhood}</span>
                  </div>

                  <div className="car-info">
                    <span className="car-type">
                      {car.year} · {car.transmission}
                    </span>

                    <h3>
                      {car.make} {car.model}
                    </h3>

                    <div className="car-specs">
                      <span>{car.seats} seats</span>
                      <span>{car.city}</span>
                    </div>

                    <div className="car-price-row">
                      <div className="car-price">
                        <strong>
                          {car.pricePerDay.toLocaleString("en-US")}
                        </strong>
                        <span> ETB / day</span>
                      </div>

                      <Link
                        href={`/cars/${car.id}`}
                        className="car-arrow"
                        aria-label={`View ${car.make} ${car.model}`}
                      >
                        ↗
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>No cars match your filters</h2>
              <p>Try changing your search or resetting the filters.</p>
              <button
                type="button"
                className="gold-button"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}

          {filteredCars.length > PAGE_SIZE && (
            <nav className="pagination" aria-label="Catalogue pages">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <main className="catalogue-page">
          <p className="detail-message">Loading cars...</p>
        </main>
      }
    >
      <CarsContent />
    </Suspense>
  );
}
