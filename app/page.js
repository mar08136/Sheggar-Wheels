
const cars = [
  {
    name: "Mercedes-Benz E-Class",
    type: "Luxury Sedan",
    price: 8500,
    seats: 5,
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85",
    tag: "MOST POPULAR",
  },
  {
    name: "BMW 5 Series",
    type: "Executive Sedan",
    price: 7200,
    seats: 5,
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85",
    tag: "EXECUTIVE",
  },
  {
    name: "Range Rover Sport",
    type: "Luxury SUV",
    price: 12000,
    seats: 5,
    transmission: "Automatic",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",
    tag: "PREMIUM SUV",
  },
];

export default function Home() {
  return (
    <main>
      <header className="navbar">
        <a href="/" className="brand">
          SHEGGAR<span>WHEELS</span>
          <span className="brand-dot">.</span>
        </a>

        <nav className="nav-links">
          <a href="#cars">Explore cars</a>
          <a href="#how-it-works">How it works</a>
          <a href="#owners">For owners</a>
        </nav>

        <div className="nav-actions">
          <a href="/signin" className="sign-in">
            Sign in
          </a>
          <a href="/signup" className="nav-button">
            Get started <span>↗</span>
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="eyebrow">
            <span className="gold-line" />
            PREMIUM CAR RENTALS IN ADDIS ABABA
          </div>

          <h1>
            Your journey.
            <br />
            <span>Your rules.</span>
          </h1>

          <p className="hero-description">
            Discover exceptional cars from trusted local owners.
            Your next journey starts with the right drive.
          </p>

          <a href="#cars" className="gold-button">
            Explore the collection <span>↗</span>
          </a>

          <div className="hero-note">
            <span className="availability-dot" />
            Find your perfect ride in Addis Ababa
          </div>
        </div>

        <div className="hero-bottom">
          <span>DRIVE SOMETHING EXTRAORDINARY</span>
          <span>09°01&apos;N 38°45&apos;E · ADDIS ABABA</span>
        </div>
      </section>

      <section className="search-section">
        <div className="search-heading">
          <span>YOUR NEXT DRIVE</span>
          <h2>Find your perfect car</h2>
        </div>

        <form action="/cars" className="search-panel">
          <label className="search-field">
            <span>LOCATION</span>
            <select name="location" defaultValue="all">
              <option value="all">All Addis Ababa</option>
              <option value="Bole">Bole</option>
              <option value="Piazza">Piazza</option>
              <option value="Kazanchis">Kazanchis</option>
            </select>
          </label>

          <label className="search-field">
            <span>PICKUP DATE</span>
            <input type="date" name="startDate" />
          </label>

          <label className="search-field">
            <span>RETURN DATE</span>
            <input type="date" name="endDate" />
          </label>

          <button className="search-button" type="submit">
            Search cars <span>→</span>
          </button>
        </form>
        <p className="demo-note">
          Demo experience · Sample cars and bookings
        </p>
      </section>

      <section className="cars-section" id="cars">
        <div className="section-top">
          <div>
            <span className="section-label">THE COLLECTION</span>
            <h2>Exceptional drives.</h2>
            <p>Find a car that matches your next adventure.</p>
          </div>
          <a href="/cars" className="text-link">
            View all cars <span>↗</span>
          </a>
        </div>

        <div className="car-grid">
          {cars.map((car) => (
            <article className="car-card" key={car.name}>
              <div className="car-image-wrap">
                <img src={car.image} alt={car.name} />
                <span className="car-tag">{car.tag}</span>
                <button
                  className="favorite-button"
                  type="button"
                  aria-label={`Save ${car.name} to favorites`}
                >
                  ♡
                </button>
              </div>

              <div className="car-info">
                <span className="car-type">{car.type}</span>
                <h3>{car.name}</h3>

                <div className="car-specs">
                  <span>♙ {car.seats} seats</span>
                  <span>↔ {car.transmission}</span>
                </div>

                <div className="car-price-row">
                  <div className="car-price">
                    <strong>
                      {car.price.toLocaleString("en-US")}
                    </strong>
                    <span> ETB / day</span>
                  </div>
                  <a
                    href="/cars"
                    className="car-arrow"
                    aria-label={`Explore ${car.name}`}
                  >
                    ↗
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="owners-section" id="owners">
        <div>
          <span className="section-label">YOUR CAR, YOUR OPPORTUNITY</span>
          <h2>Let your car earn while you&apos;re away.</h2>
          <p>
            Connect with people who need a car and turn your
            idle vehicle into an income opportunity.
          </p>
        </div>
        <a href="/signup" className="gold-button">
          Become an owner <span>↗</span>
        </a>
      </section>

      <section className="how-section" id="how-it-works">
        <span className="section-label">SIMPLE BY DESIGN</span>
        <h2>Three steps. One great drive.</h2>

        <div className="steps-grid">
          <article>
            <span className="step-number">01</span>
            <h3>Find your car</h3>
            <p>Browse available vehicles and choose the one you love.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <h3>Request your trip</h3>
            <p>Choose your dates and submit your rental request.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <h3>Enjoy the journey</h3>
            <p>Track your booking status and get ready to hit the road.</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <a href="/" className="brand">
          SHEGGAR<span>WHEELS</span><span className="brand-dot">.</span>
        </a>
        <p>Made for the road ahead. Addis Ababa, Ethiopia.</p>
        <span>DEMO PROJECT · 2026</span>
      </footer>
    </main>
  );
}
