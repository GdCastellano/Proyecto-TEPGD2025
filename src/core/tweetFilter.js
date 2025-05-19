const filterParameters = {
    "País": [
        "Ecuador",
        "ECU",
        "México",
        "MEX",
        "Jamaica",
        "JAM",
        "Canadá",
        "CAN"
    ],
    "Title": [
        "Copa América 2024",
        "Copa América USA 2024"
    ],
    "Team": [
        "Venezuela",
        "Vinotinto",
        "FVF_Oficial"
    ],
    "Player": [
        "Romo",
        "Rafael Romo",
        "Bello",
        "Eduard Bello",
        "Rondón",
        "Salomón Rondón",
        "Soteldo",
        "Batista",
        "Bocha Batista"
    ],
    "Results": [
        "Gol",
        "Goles",
        "Partido",
        "Partidos",
        "Penal",
        "Penales",
        "Victoria",
        "Ganó",
        "Gana",
        "Derrota",
        "Perdió",
        "Pierde",
        "Empate",
        "Empataron",
        "Clasificado",
        "Clasificación",
        "Cuartos de Final",
        "4tos de Final",
        "Semifinal",
        "Final"
    ],
    "Dates": [
        "21-06-2024",
        "22-06-2024",
        "23-06-2024",
        "25-06-2024",
        "26-06-2024",
        "27-06-2024",
        "29-06-2024",
        "30-06-2024",
        "01-07-2024",
        "04-07-2024",
        "05-07-2024",
        "06-07-2024"
    ]
};

/**
 * Concatena todas las palabras clave en una sola lista plana para facilitar la búsqueda.
 * Se convierte a minúsculas una vez para mejorar la eficiencia en la comparación case-insensitive.
 */
const allKeywords = Object.values(filterParameters).flat().map(keyword => keyword.toLowerCase());

/**
 * Filtra un objeto de tweet basándose en la presencia de palabras clave y métricas públicas.
 *
 * @param {object} tweet - El objeto tweet a filtrar.
 * @param {number} [minLikes=0] - El número mínimo de 'likes' que debe tener el tweet para pasar el filtro. Por defecto es 0.
 * @param {number} [minRetweets=0] - El número mínimo de 'retweets' que debe tener el tweet para pasar el filtro. Por defecto es 0.
 * @returns {Promise<object>} - El objeto tweet si pasa el filtro, o un objeto vacío ({}) si no lo pasa o si ocurre un error.
 */
export const tweetFilter = async (tweet, minLikes = 0, minRetweets = 0) => {
    try {

        if (!tweet || typeof tweet.text !== 'string' || !tweet.public_metrics) {
            console.warn("Objeto tweet inválido o incompleto recibido:", tweet);
            return {};
        }

        const { text, public_metrics } = tweet;
        const likeCount = typeof public_metrics.like_count === 'number' ? public_metrics.like_count : 0;
        const retweetCount = typeof public_metrics.retweet_count === 'number' ? public_metrics.retweet_count : 0;

        let keywordMatchFound = false;
        const lowerCaseTweetText = text.toLowerCase();

        for (const keyword of allKeywords) {
            if (lowerCaseTweetText.includes(keyword)) {
                keywordMatchFound = true;
                break;
            }
        }

        const meetsLikeCount = likeCount >= minLikes;
        const meetsRetweetCount = retweetCount >= minRetweets;

        if (keywordMatchFound /*&& meetsLikeCount && meetsRetweetCount*/) {
            return tweet;
        } else {
            return {};
        }

    } catch (error) {
        console.error("Error filtering tweet:", error, tweet);
        return {};
    }
};
