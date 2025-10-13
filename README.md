# Chatbot con Integración Twilio WhatsApp

Este proyecto implementa un chatbot especializado en análisis de planos de casas que puede funcionar tanto como API REST como webhook para Twilio WhatsApp.

## Características

- 🤖 **Chatbot especializado** en análisis de planos de casas
- 📄 **Procesamiento de PDFs** usando pdfjs-dist
- 🚀 **API REST** para integración web
- 📱 **Webhook de Twilio** para WhatsApp
- 🏠 **Análisis inteligente** de planos arquitectónicos

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/charlieba/chatbot-server.git
cd chatbot-server
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp env.example .env
```

Edita el archivo `.env` y agrega:
```
OPENAI_API_KEY=tu_clave_de_openai_aqui
PORT=3001
```

4. Ejecuta el servidor:
```bash
npm start
```

## Endpoints Disponibles

### 1. API REST - Chat General
**POST** `/api/chat`
```json
{
  "message": "¿Cuántas habitaciones tiene la casa?"
}
```

**Respuesta:**
```json
{
  "reply": "La casa tiene un total de 5 habitaciones..."
}
```

### 2. Webhook de Twilio WhatsApp
**POST** `/api/twilio-webhook`

Este endpoint está diseñado para recibir webhooks de Twilio. Twilio enviará datos en formato `application/x-www-form-urlencoded`:

- `Body`: El mensaje del usuario
- `From`: Número de teléfono del remitente
- `To`: Número de teléfono de destino

**Respuesta:** TwiML XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Respuesta del chatbot...</Message>
</Response>
```

### 3. Testing de Twilio
**POST** `/api/twilio-test`

Endpoint para probar la funcionalidad de Twilio sin configurar el webhook real.

```json
{
  "Body": "¿Cuál es la superficie total?",
  "From": "whatsapp:+1234567890",
  "To": "whatsapp:+0987654321"
}
```

### 4. Estado del PDF
**GET** `/api/pdf-status`

Verifica si el PDF se cargó correctamente.

## Configuración de Twilio WhatsApp

### 1. Configurar el Webhook en Twilio

1. Ve a la [Consola de Twilio](https://console.twilio.com/)
2. Navega a **Messaging** > **Settings** > **WhatsApp sandbox**
3. En **Webhook URL**, ingresa: `https://tu-dominio.com/api/twilio-webhook`
4. En **HTTP method**, selecciona **POST**

### 2. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# OpenAI
OPENAI_API_KEY=tu_clave_openai

# Twilio (opcional, para validación)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token

# Servidor
PORT=3001
```

### 3. Desplegar en Producción

Para usar en producción, necesitarás:

1. **Dominio público** con HTTPS
2. **Servidor web** (Heroku, Railway, DigitalOcean, etc.)
3. **Configurar el webhook** en Twilio con tu URL pública

## Ejemplos de Uso

### Preguntas que puede responder el chatbot:

- "¿Cuántas habitaciones tiene la casa?"
- "¿Cuál es la superficie total?"
- "¿Qué dimensiones tiene la cocina?"
- "¿Dónde está ubicado el baño principal?"
- "¿Cuántos niveles tiene la casa?"
- "¿Qué mobiliario hay en la sala principal?"

### Respuesta de ejemplo:

```
La casa Residencia Los Robles 27 tiene:

🏠 **Superficie total**: 215 m²
🏗️ **Niveles**: 2
📍 **Ubicación**: Calle de los Pinos #27, Colonia Jardines del Lago

**Habitaciones**:
- Dormitorio Principal: 4.5 x 5.2 m
- Dormitorio Secundario 1: 3.2 x 3.8 m  
- Dormitorio Secundario 2: 3.0 x 3.5 m
- Sala de Estudio: 2.5 x 2.5 m

**Otros espacios**:
- Sala Principal: 6.0 x 4.5 m
- Comedor: 4.0 x 4.0 m
- Cocina: 3.8 x 3.2 m
- Jardín trasero: 6.0 x 5.0 m
```

## Estructura del Proyecto

```
backend/
├── server.js              # Servidor principal
├── package.json           # Dependencias
├── .env                   # Variables de entorno
├── .gitignore            # Archivos ignorados por Git
├── Plano_Casa_Prueba_Chatbot.pdf  # PDF del plano
└── README.md             # Este archivo
```

## Dependencias

- **express**: Servidor web
- **openai**: Integración con OpenAI GPT
- **pdfjs-dist**: Procesamiento de PDFs
- **twilio**: SDK de Twilio para TwiML
- **cors**: Middleware CORS
- **dotenv**: Variables de entorno

## Desarrollo

Para desarrollo local:

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar servidor
npm start
```

## Licencia

MIT License

## Soporte

Para soporte o preguntas, contacta al desarrollador o crea un issue en el repositorio.
