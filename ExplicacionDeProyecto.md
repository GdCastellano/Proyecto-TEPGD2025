# FIFA Tweets Extractor

Un sistema para extraer, analizar y visualizar tweets sobre las fechas FIFA de la selección venezolana usando una base de datos NoSQL y Power BI.

---

## 🏁 Introducción

Este proyecto, desarrollado para la asignatura **Bases de Datos 2**, analiza el sentir de los aficionados venezolanos en la red social X durante las eliminatorias sudamericanas al Mundial 2026. Con la selección venezolana, conocida como **la Vinotinto**, cerca de lograr su primera clasificación a un Mundial, este sistema captura las emociones y tendencias expresadas por los hinchas en un momento histórico para el país.

Utilizando tecnologías modernas como la API de X, una base de datos NoSQL en Supabase y visualizaciones en Power BI, el proyecto ofrece una solución completa para el análisis de datos sociales.

---

## ✨ Características

- **Extracción optimizada de tweets:** Usa la API de X para recolectar publicaciones de hasta 10 cuentas, optimizando las solicitudes para respetar el límite de 100 lecturas mensuales.
- **Almacenamiento NoSQL:** Guarda los tweets en una base de datos NoSQL implementada en Supabase mediante una estructura de documentos JSONB, permitiendo flexibilidad y escalabilidad.
- **Análisis de sentimiento y tendencias:** Clasifica las publicaciones como positivas, negativas o neutrales, e identifica hashtags y palabras clave relevantes (por ejemplo, `#Vinotinto`, `#Mundial2026`).
- **Visualización interactiva:** Exporta los datos procesados a Power BI para crear un dashboard con gráficos de sentimiento, tendencias y actividad temporal.

---

## 🛠️ Requisitos

- Node.js v14 o superior
- Cuenta en X Developer con acceso a la API v2 (nivel gratuito)
- Cuenta en Supabase con un proyecto configurado

### Bibliotecas Node.js

- `twitter-api-v2`
- `@supabase/supabase-js`
- `natural` (para análisis de texto)
- `node-fetch` (para usar APIs externas)
- `dotenv` (para manejar variables de entorno)

---

## 🚀 Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu_usuario/fifa-tweets-extractor.git
   cd fifa-tweets-extractor
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura el archivo `.env`** (ver sección de Configuración).

---

## ⚙️ Configuración

### Credenciales de X

Solicita acceso a la API de X en [X Developer](https://developer.twitter.com/en/portal/dashboard).

Desde el portal de desarrolladores de X, obtén las siguientes credenciales:

- **API Key:** Identificador de tu aplicación.
- **API Secret:** Clave secreta de tu aplicación.
- **Access Token:** Token para actuar en nombre de un usuario (no necesario para este proyecto).
- **Access Token Secret:** Secreto asociado al Access Token (no necesario para este proyecto).
- **Bearer Token:** Token para autenticación a nivel de aplicación (usado en este proyecto).

> **Nota:** Para este proyecto, solo necesitas el Bearer Token, ya que permite leer tweets públicos sin autenticación OAuth completa.

### Credenciales de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Obtén la URL del proyecto y la clave anon.
3. Crea la tabla `tweets_nosql` en Supabase usando el siguiente SQL:

   ```sql
   CREATE TABLE tweets_nosql (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     tweet_data JSONB NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     username TEXT NOT NULL
   );
   ```

### Archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
TWITTER_API_KEY=tu_api_key
TWITTER_API_SECRET=tu_api_secret
TWITTER_ACCESS_TOKEN=tu_access_token
TWITTER_ACCESS_TOKEN_SECRET=tu_access_token_secret
TWITTER_BEARER_TOKEN=tu_bearer_token
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
HUGGING_FACE_API_KEY=tu_hugging_face_api_key # para análisis de tendencias y sentimientos en español
```

- `TWITTER_API_KEY` y `TWITTER_API_SECRET`: Credenciales de tu aplicación en X (no usadas directamente en este proyecto).
- `TWITTER_ACCESS_TOKEN` y `TWITTER_ACCESS_TOKEN_SECRET`: Tokens para acciones en nombre de un usuario (no necesarios aquí).
- `TWITTER_BEARER_TOKEN`: Token usado para autenticar las solicitudes a la API de X en este proyecto.
- `SUPABASE_URL` y `SUPABASE_ANON_KEY`: Credenciales de Supabase.
- `HUGGING_FACE_API_KEY`: Clave para el análisis de sentimiento en español (regístrate en [Hugging Face](https://huggingface.co/)).

---

## 📝 Uso

El script principal, `extractTweets.js`, permite extraer tweets de cuentas especificadas, guardarlos en Supabase y prepararlos para el análisis. Usa el Bearer Token para autenticación.

### Ejemplo de uso

```javascript
const { extractTweets } = require('./extractTweets');

const params = {
  accounts: ['SeleVinotinto', 'FVF_Oficial'],
  maxTweets: 15, // Mínimo 5, máximo 100
  startDate: '2024-10-01',
  endDate: '2024-11-30',
};

const twitterConfig = {
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
};

const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
};

extractTweets({ ...params, twitterConfig, supabaseConfig });
```

#### Parámetros

- `accounts`: Array de nombres de usuario de X (máximo 10).
- `maxTweets`: Número máximo de tweets a extraer por cuenta (5 a 100).
- `startDate` y `endDate`: Fechas en formato `YYYY-MM-DD` para filtrar tweets.

---

## 🗄️ Estructura de la Base de Datos

Los tweets se almacenan en una tabla NoSQL (`tweets_nosql`) en Supabase, usando una columna JSONB para flexibilidad.  
Cada documento incluye:

```json
{
  "tweet_id": "123456789",
  "text": "¡Vamos Vinotinto! #Mundial2026",
  "created_at": "2024-10-10T12:00:00Z",
  "metrics": {
    "likes": 50,
    "retweets": 20
  },
  "sentiment": "Positivo",
  "hashtags": ["#Vinotinto", "#Mundial2026"],
  "keywords": ["Vamos", "Vinotinto"]
}
```

---

## 📊 Análisis y Visualización

- **Sentimiento:** Usa Hugging Face para análisis en español.
- **Tendencias:** Extrae hashtags y palabras clave relevantes.
- **Visualización:** Exporta a CSV y visualiza en Power BI.

---

## ¡Vamos Vinotinto! 🇻🇪⚽