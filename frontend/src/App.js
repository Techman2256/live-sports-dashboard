import { useState, useEffect } from "react";

const API = "https://lnc7apsk7d.execute-api.us-east-1.amazonaws.com";

function GameCard({ game }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary("Failed to get summary.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.status}>{game.status}</div>
      <div style={styles.teams}>
        <div style={styles.team}>
          <img src={game.awayTeam.logo} alt={game.awayTeam.name} style={styles.logo} />
          <div style={styles.teamName}>{game.awayTeam.name}</div>
          <div style={styles.score}>{game.awayTeam.score}</div>
        </div>
        <div style={styles.vs}>VS</div>
        <div style={styles.team}>
          <img src={game.homeTeam.logo} alt={game.homeTeam.name} style={styles.logo} />
          <div style={styles.teamName}>{game.homeTeam.name}</div>
          <div style={styles.score}>{game.homeTeam.score}</div>
        </div>
      </div>
      <button onClick={summarize} disabled={loading} style={styles.button}>
        {loading ? "Analyzing..." : "AI Summary"}
      </button>
      {summary && <div style={styles.summary}>{summary}</div>}
    </div>
  );
}

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/scores`)
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load scores.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏀 Live Sports Dashboard</h1>
        <p style={styles.subtitle}>Powered by AWS Lambda + Claude AI</p>
      </div>
      {loading && <div style={styles.message}>Loading games...</div>}
      {error && <div style={styles.message}>{error}</div>}
      <div style={styles.grid}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "#fff",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    padding: "40px 0 30px",
    borderBottom: "1px solid #222",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    margin: 0,
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#888",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "#1a1a2e",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #2a2a4a",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  status: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#667eea",
    marginBottom: "16px",
    fontWeight: "600",
  },
  teams: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  team: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  logo: {
    width: "60px",
    height: "60px",
    objectFit: "contain",
  },
  teamName: {
    fontSize: "0.8rem",
    textAlign: "center",
    color: "#ccc",
  },
  score: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#fff",
  },
  vs: {
    color: "#444",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  summary: {
    marginTop: "16px",
    padding: "14px",
    background: "#0f0f1a",
    borderRadius: "8px",
    fontSize: "0.9rem",
    lineHeight: "1.6",
    color: "#ccc",
    borderLeft: "3px solid #667eea",
  },
  message: {
    textAlign: "center",
    color: "#888",
    padding: "40px",
  },
};
