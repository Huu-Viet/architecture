import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function App() {
  const [health, setHealth] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [orderResult, setOrderResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const orderPayload = useMemo(
    () => ({
      restaurantId: 'res-001',
      userId: 'user-001',
      items: ['pho-bo', 'tra-da'],
      totalAmount: 125000,
    }),
    [],
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [healthRes, restaurantsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/health`),
          fetch(`${API_BASE_URL}/restaurants`),
        ]);

        if (!healthRes.ok || !restaurantsRes.ok) {
          throw new Error('Cannot fetch API data.');
        }

        const healthData = await healthRes.json();
        const restaurantsData = await restaurantsRes.json();
        setHealth(healthData);
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      } catch (fetchError) {
        setError(fetchError.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function createDemoOrder() {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        throw new Error('Cannot create order.');
      }

      const data = await response.json();
      setOrderResult(data);
    } catch (createError) {
      setError(createError.message || 'Unknown error');
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Online Food Delivery Monolith</h1>
        <p>Frontend (React) running in Docker and fetching backend APIs.</p>
        <p>
          API Base URL: <strong>{API_BASE_URL}</strong>
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Health</h2>
          {loading && <p>Loading...</p>}
          {!loading && health && <pre>{JSON.stringify(health, null, 2)}</pre>}
        </article>

        <article className="card">
          <h2>Restaurants</h2>
          {loading && <p>Loading...</p>}
          {!loading && restaurants.length > 0 && (
            <ul>
              {restaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  {restaurant.name} ({restaurant.cuisine})
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="card">
        <h2>Create Demo Order</h2>
        <button type="button" onClick={createDemoOrder}>
          Create Order
        </button>
        {orderResult && <pre>{JSON.stringify(orderResult, null, 2)}</pre>}
      </section>

      {error && (
        <section className="card error">
          <h2>Error</h2>
          <p>{error}</p>
        </section>
      )}
    </main>
  );
}

export default App;
