// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const twilio = require('twilio');

dotenv.config();

const app = express();
app.use(cors());

// Middleware para parsear datos de formulario (necesario para Twilio)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configura el cliente de OpenAI
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Variable para almacenar el contenido del PDF
let pdfContent = "";

// Función para leer el PDF
async function loadPDF() {
  try {
    const dataBuffer = fs.readFileSync("./Plano_Casa_Prueba_Chatbot.pdf");
    
    // Convertir Buffer a Uint8Array
    const uint8Array = new Uint8Array(dataBuffer);
    
    // Cargar el documento PDF
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Extraer texto de todas las páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    pdfContent = fullText;
    console.log("✅ PDF cargado exitosamente");
    console.log(`📄 Contenido extraído: ${pdfContent.length} caracteres`);
    console.log(`📖 Páginas procesadas: ${pdf.numPages}`);
  } catch (error) {
    console.error("❌ Error al cargar el PDF:", error);
  }
}

// Cargar el PDF al iniciar el servidor
loadPDF();

// Prompt base del bot
const SYSTEM_PROMPT = `
Eres un asistente especializado en análisis de planos de casas llamado CasaBot 🏠.
Tienes acceso a la información de un plano de casa específico y puedes responder preguntas sobre:
- Distribución de espacios y habitaciones
- Dimensiones y medidas
- Características arquitectónicas
- Ubicación de elementos específicos
- Cualquier detalle visible en el plano

Información del plano disponible:
${pdfContent}

Responde de forma clara, detallada y profesional. Si la pregunta no está relacionada con el plano, indícalo cortésmente y ofrece ayuda con temas relacionados a arquitectura o planos de casas.
`;

// Ruta principal del chatbot
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Crear el prompt dinámico con el contenido del PDF
    const dynamicPrompt = `
Eres un asistente especializado en análisis de planos de casas llamado CasaBot 🏠.
Tienes acceso a la información de un plano de casa específico y puedes responder preguntas sobre:
- Distribución de espacios y habitaciones
- Dimensiones y medidas
- Características arquitectónicas
- Ubicación de elementos específicos
- Cualquier detalle visible en el plano

Información del plano disponible:
${pdfContent}

Responde de forma clara, detallada y profesional. Si la pregunta no está relacionada con el plano, indícalo cortésmente y ofrece ayuda con temas relacionados a arquitectura o planos de casas.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: dynamicPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error en el chat:", error);
    res.status(500).json({ error: "Ocurrió un error al generar la respuesta" });
  }
});

// Webhook para Twilio WhatsApp
app.post("/api/twilio-webhook", async (req, res) => {
  try {
    const { Body, From, To } = req.body;
    
    console.log(`📱 Mensaje recibido de ${From}: ${Body}`);
    
    // Crear el prompt dinámico con el contenido del PDF
    const dynamicPrompt = `
Eres un asistente especializado en análisis de planos de casas llamado CasaBot 🏠.
Tienes acceso a la información de un plano de casa específico y puedes responder preguntas sobre:
- Distribución de espacios y habitaciones
- Dimensiones y medidas
- Características arquitectónicas
- Ubicación de elementos específicos
- Cualquier detalle visible en el plano

Información del plano disponible:
${pdfContent}

Responde de forma clara, detallada y profesional. Si la pregunta no está relacionada con el plano, indícalo cortésmente y ofrece ayuda con temas relacionados a arquitectura o planos de casas.

Mantén las respuestas concisas para WhatsApp (máximo 1600 caracteres por mensaje).
`;

    // Obtener respuesta de OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: dynamicPrompt },
        { role: "user", content: Body },
      ],
    });

    const reply = response.choices[0].message.content;
    
    // Crear respuesta TwiML
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);
    
    // Configurar headers para TwiML
    res.type('text/xml');
    res.send(twiml.toString());
    
    console.log(`🤖 Respuesta enviada: ${reply.substring(0, 100)}...`);
    
  } catch (error) {
    console.error("❌ Error en webhook de Twilio:", error);
    
    // Enviar mensaje de error en TwiML
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("Lo siento, ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.");
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Endpoint para testing del webhook de Twilio (acepta JSON)
app.post("/api/twilio-test", async (req, res) => {
  try {
    const { Body, From, To } = req.body;
    
    console.log(`🧪 Test - Mensaje recibido de ${From}: ${Body}`);
    
    // Crear el prompt dinámico con el contenido del PDF
    const dynamicPrompt = `
Eres un asistente especializado en análisis de planos de casas llamado CasaBot 🏠.
Tienes acceso a la información de un plano de casa específico y puedes responder preguntas sobre:
- Distribución de espacios y habitaciones
- Dimensiones y medidas
- Características arquitectónicas
- Ubicación de elementos específicos
- Cualquier detalle visible en el plano

Información del plano disponible:
${pdfContent}

Responde de forma clara, detallada y profesional. Si la pregunta no está relacionada con el plano, indícalo cortésmente y ofrece ayuda con temas relacionados a arquitectura o planos de casas.

Mantén las respuestas concisas para WhatsApp (máximo 1600 caracteres por mensaje).
`;

    // Obtener respuesta de OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: dynamicPrompt },
        { role: "user", content: Body },
      ],
    });

    const reply = response.choices[0].message.content;
    
    // Crear respuesta TwiML para mostrar cómo se vería
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);
    
    res.json({
      success: true,
      message: "Respuesta generada exitosamente",
      twiml: twiml.toString(),
      reply: reply,
      from: From,
      to: To
    });
    
    console.log(`🤖 Test - Respuesta generada: ${reply.substring(0, 100)}...`);
    
  } catch (error) {
    console.error("❌ Error en test de Twilio:", error);
    res.status(500).json({ 
      success: false,
      error: "Ocurrió un error al procesar la consulta",
      details: error.message 
    });
  }
});

// Ruta para verificar el estado del PDF
app.get("/api/pdf-status", (req, res) => {
  res.json({ 
    loaded: pdfContent.length > 0,
    contentLength: pdfContent.length,
    message: pdfContent.length > 0 ? "PDF cargado correctamente" : "PDF no cargado"
  });
});

// Puerto de ejecución
const PORT = process.env.PORT || 3001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log("💡 Presiona Ctrl+C para detener el servidor.");
});

// Detecta cierre con Ctrl+C
process.on("SIGINT", () => {
  console.log("\n🛑 Servidor detenido manualmente.");
  process.exit(0);
});