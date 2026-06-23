export const handler = async () => {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
    );
    const data = await res.json();

    const games = data.events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      status: event.status.type.description,
      homeTeam: {
        name: event.competitions[0].competitors[0].team.displayName,
        score: event.competitions[0].competitors[0].score,
        logo: event.competitions[0].competitors[0].team.logo
      },
      awayTeam: {
        name: event.competitions[0].competitors[1].team.displayName,
        score: event.competitions[0].competitors[1].score,
        logo: event.competitions[0].competitors[1].team.logo
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(games)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
