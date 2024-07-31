const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient, Payload } = require("dialogflow-fulfillment");
const localtunnel = require("localtunnel");
const port = 4000;

// Create server
const app = express();

// Use middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome, this is a webhook for Line Chatbot</h1>");
});

app.post("/webhook", (req, res) => {
  const agent = new WebhookClient({
    request: req,
    response: res,
  });

  console.log("Dialogflow Request headers: " + JSON.stringify(req.headers));
  console.log("Dialogflow Request body: " + JSON.stringify(req.body));

  function welcome(agent) {
    agent.add("Welcome to the Dialogflow agent!");
  }

  function fallback(agent) {
    agent.add("I didn't understand that.");
    agent.add("Can you say that again?");
  }

  function calculateCircleArea(agent) {
    let radius = agent.parameters.radius;

    radius = parseFloat(radius);

    console.log("Received parameter: radius =", radius);

    if (isNaN(radius)) {
      agent.add("ข้อมูลที่ได้รับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    } else {
      let area = Math.PI * Math.pow(radius, 2);

      const flexMessage = {
        type: "flex",
        altText: "ผลลัพธ์การคำนวณพื้นที่",
        contents: {
          type: "bubble",
          size: "giga",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "ผลลัพธ์การคำนวณพื้นที่",
                weight: "bold",
                size: "xl",
                margin: "md",
              },
              {
                type: "text",
                text: `พื้นที่ของวงกลมคือ ${area.toFixed(2)} ตารางหน่วย`,
                size: "md",
                margin: "md",
                wrap: true,
              },
            ],
          },
        },
      };

      const payload = new Payload("LINE", flexMessage, { sendAsMessage: true });
      agent.add(payload);
    }
  }

  function calculateTriangleArea(agent) {
    let base = agent.parameters.base;
    let height = agent.parameters.height;

    base = parseFloat(base);
    height = parseFloat(height);

    console.log("Received parameters: base =", base, ", height =", height);

    if (isNaN(base) || isNaN(height)) {
      agent.add("ข้อมูลที่ได้รับไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    } else {
      let area = 0.5 * base * height;

      const flexMessage = {
        type: "flex",
        altText: "ผลลัพธ์การคำนวณพื้นที่",
        contents: {
          type: "bubble",
          size: "giga",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "ผลลัพธ์การคำนวณพื้นที่",
                weight: "bold",
                size: "xl",
                margin: "md",
              },
              {
                type: "text",
                text: `พื้นที่ของสามเหลี่ยมคือ ${area.toFixed(2)} ตารางหน่วย`,
                size: "md",
                margin: "md",
                wrap: true,
              },
            ],
          },
        },
      };

      const payload = new Payload("LINE", flexMessage, { sendAsMessage: true });
      agent.add(payload);
    }
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("area - circle - custom - yes", calculateCircleArea);
  intentMap.set("area - triangle - custom - yes", calculateTriangleArea);

  agent.handleRequest(intentMap);
});

// Start the server and the local tunnel
(async () => {
  const server = app.listen(port, () => {
    console.log("Server is running at http://localhost:" + port);
  });

  try {
    const tunnel = await localtunnel({
      port,
      subdomain: "your-custom-subdomain",
    });
    console.log("Publicly accessible URL:", tunnel.url);

    // Clean up
    process.on("exit", () => {
      tunnel.close();
      server.close();
    });
  } catch (error) {
    console.error("Error establishing local tunnel:", error);
  }
})();
