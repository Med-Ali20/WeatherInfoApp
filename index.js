const express = require("express");
const axios = require("axios");
require('dotenv')
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000

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
};

const updateRecords = async (id, recordWeatherInfo, city) => {
  let fields = {};
  fields[`Low Temp - ${city}`] =
    recordWeatherInfo.forecast.forecastday[0].day.mintemp_f;
  fields[`High Temp - ${city}`] =
    recordWeatherInfo.forecast.forecastday[0].day.maxtemp_f;
  fields[`Weather Condition - ${city}`] =
    recordWeatherInfo.forecast.forecastday[0].day.condition.text;
  axios
    .patch(
      `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`,
      {
        fields,
      },
      {
        headers: {
          Authorization: `Bearer ${airTableToken}`,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.log(error);
      return;
    });
};

app.get('/', (req, res) => {
  res.send('<h1> Weather Info API </h1>')
})

app.post("/webhook", async (req, res) => {
  const records = [...req.body];
  const filteredRecords = records.filter((el) => {
    return el.name !== "Unnamed record";
  });
  filteredRecords.sort((a, b) => {
    return new Date(b.name) - new Date(a.name);
  });
  console.log(filteredRecords)
  const recordId = filteredRecords[0].id;
  const recordDate = filteredRecords[0].name
  const date = new Date(recordDate);
  
  const year = date.getFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + 1;
  console.log(day)
  try {
    await Promise.all(
      locations.map(async (location) => {
        const res = await getWeatherInfo(
          weatherProviderAppKey,
          location.location,
          `${year.toString()}-${month.toString()}-${day.toString()}`
        );
        await updateRecords(recordId, res.data, location.city);
      })
    );
  } catch (error) {
    console.log(error);
    try {
      await Promise.all(
      locations.map(async (location) => {
        const res = await getWeatherInfo(
          weatherProviderAppKey,
          location.location,
          `${year.toString()}-${month.toString()}-${day.toString()}`
        );
        await updateRecords(recordId, res.data, location.city);
      })
    );
    } catch (error) {
      console.log(error)
      
    }
  }
  res.status(201).json('')

});

// The code below was created to update the already existing records with weather info and probably will not be needed again

// let records = [];

// const fetchRecords = async (offsetArg) => {
//   try {
//     const headers = {
//       Authorization: `Bearer ${airTableToken}`,
//     };
//     const params = {
//       view: lasVegasViewId,
//       offset: offsetArg ? offsetArg : null,
//     };
//     const res = await axios.get(
//       `https://api.airtable.com/v0/${baseId}/${tableId}`,
//       {
//         headers,
//         params,
//       }
//     );
//     records = [...records, ...res.data.records];
//     records.sort((a, b) => {
//       return new Date(b.fields.Date) - new Date(a.fields.Date);
//     });
//     console.log(records.length);
//     return res;
//   } catch (error) {
//     console.log(error);
//   }
// };

// const listRecords = async () => {
//   try {
//     const res = await fetchRecords();
//     if (res.data.offset) {
//       const res2 = await fetchRecords(res.data.offset);
//       if (res2.data.offset) {
//         const res3 = await fetchRecords(res2.data.offset);
//         if (res3.data.offset) {
//           const res4 = await fetchRecords(res3.data.offset);
//           if (res4.data.offset) {
//             const res5 = await fetchRecords(res4.data.offset);
//             if (res5.data.offset) {
//               const res6 = await fetchRecords(res5.data.offset);
//               if (res6.data.offset) {
//                 const res7 = await fetchRecords(res6.data.offset);
//                 if (res7.data.offset) {
//                   const res8 = await fetchRecords(res7.data.offset);
//                   if (res8.data.offset) {
//                     const res9 = await fetchRecords(res8.data.offset);
//                     if (res9.data.offset) {
//                       await fetchRecords(res9.data.offset);
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// This function gets the weather info for each record and updates the record with the weather info retrieved
// const getAndPostWeatherInfo = async () => {
//   try {
//     records.map((record, i) => {
//       const date = new Date(record.fields.Date);
//       const year = date.getFullYear();
//       const month = date.getUTCMonth() + 1;
//       const day = date.getUTCDate();
//       if (record.fields.Date) {
//         try {
//           setTimeout(async () => {
//             const recordWeatherInfo = await getWeatherInfo(
//               weatherProviderAppKey,
//               location,
//               `${year.toString()}-${month.toString()}-${day.toString()}`
//             );
//             updateRecords(record, recordWeatherInfo);
//           }, i * 120);
//         } catch (error) {
//           return;
//         }
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

app.listen(PORT, () => {
  console.log(`App is Running On Port ${PORT}`);
});
