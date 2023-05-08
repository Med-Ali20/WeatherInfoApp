const express = require("express");
const axios = require("axios");
require("dotenv");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

const airTableToken =
  "patzjlikGLPoDa8NS.5030003bc18705e531ea973fd7c644a83ea1677cb640858df738acf98b254691";
const baseId = "appmLD2wGwYb4Y2NY";
const tableId = "tblDVk9fMPhFw2Ili";
const weatherProviderAppKey = "06dc8043b53a4951a14103650232003";

const locations = [
  {
    location: "37.8835761,-122.312086",
    city: "Berkeley",
  },
  {
    location: "32.9731179,-117.260633",
    city: "San Diego",
  },
  {
    location: "34.1606364,-118.1674865",
    city: "Los Angeles",
  },
  {
    location: "38.5903681,-121.4354065",
    city: "Sacramento",
  },
  {
    location: "37.301665,-121.8522536",
    city: "San Jose",
  },
  {
    location: "37.5476781,-122.2985636",
    city: "San Mateo",
  },
  {
    location: "36.269878,-115.012779",
    city: "Vegas",
  },
];

const getWeatherInfo = async (key, q, dt) => {
  try {
    const recordWeatherInfo = await axios.get(
      "http://api.weatherapi.com/v1/history.json",
      {
        params: {
          key,
          q,
          dt,
        },
      }
    );
    return recordWeatherInfo;
  } catch (error) {
    console.log(error);
  }
};

const updateRecords = async (id, recordWeatherInfo, city) => {
  let fields = {};
  fields[`Low Temp - ${city}`] =
    recordWeatherInfo.forecast.forecastday[0].day.mintemp_f;
  fields[`High Temp - ${city}`] =
    recordWeatherInfo.forecast.forecastday[0].day.maxtemp_f;
  fields[`Weather Condition - ${city}`] =
    recordWeatherInfo.forecast.forecastday[0].day.condition.text;
  try {
    axios.patch(
      `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`,
      {
        fields,
      },
      {
        headers: {
          Authorization: `Bearer ${airTableToken}`,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

app.get("/", (req, res) => {
  res.send("<h1> Weather Info API </h1>");
});

app.post("/webhook", async (req, res) => {
  try {
    const records = [...req.body];
    res.status(201).json("");
    const filteredRecords = records.filter((el) => {
      return el.name !== "Unnamed record";
    });
    filteredRecords.sort((a, b) => {
      return new Date(b.name) - new Date(a.name);
    });
    const recordId = filteredRecords[0].id;
    const initailDate = new Date();
    const cairoDateString = initailDate.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
    });
    const date = new Date(cairoDateString);

    const year = date.getFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getDate();
    console.log(day);
    await Promise.all(
      locations.map(async (location, i) => {
        setTimeout(async () => {
          const res = await getWeatherInfo(
            weatherProviderAppKey,
            location.location,
            `${year.toString()}-${month.toString()}-${day.toString()}`
          );
          await updateRecords(recordId, res.data, location.city);
        }, i * 120);
      })
    );
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`App is Running On Port ${PORT}`);
});
