const btnSearch = document.getElementById("btnSearch");
const btnClear = document.getElementById("btnClear");
const keywordInput = document.getElementById("keywordInput");
const modalSearch = document.getElementById("modalSearch");

const foundDestinations = [];

function searchKeyword() {

  const inputString = keywordInput.value.trim().toLowerCase()

  fetch("./travel_recommendation_api.json")
    .then((response) => response.json())
    .then((data) => {
      foundDestinations.length = "";
      for (destination in data) {
        if (destination == "countries") {
          for (country of data.countries) {
            const foundCities = country.cities?.filter((city) => city.name.toLowerCase().includes(inputString));
            // const foundCitiesWithTimeZone = foundCities.map((city) => ({...city, timeZone: getTimeZoneByCity(city.name.split(", ")[0]), })); // generating new array and new objects
            foundCities.map((city) => { city.timeZone = getTimeZoneByCity(city.name.split(", ")[0]); return city; }); // mutating the original array
            foundDestinations.push(...foundCities);
          }
        }
        else if (destination.toLowerCase().includes(inputString))
          foundDestinations.push(...data[destination]);
      }
      displayRecommendations();
    })
    .catch((error) => console.log("error while fetching data: ", error));
}

function displayRecommendations() {
  if (foundDestinations.length !== 0) {
    for (destination of foundDestinations) {

      if (destination.timeZone) {
        const timeZoneDiv = document.createElement("div");
        timeZoneDiv.classList.add("timeZoneDiv");
        timeZoneDiv.innerHTML = `Current Local Time (${destination.name}): ${getTimebyTimeZone(destination.timeZone)}`
        modalSearch.appendChild(timeZoneDiv);
      }

      const recommendationDiv = document.createElement("div");
      recommendationDiv.classList.add("recommendation");
      recommendationDiv.innerHTML += `<image src="${destination.imageUrl}"/>`;
      recommendationDiv.innerHTML += `<h3>${destination.name}</h3>`;
      recommendationDiv.innerHTML += `<p>${destination.description}</p>`;
      recommendationDiv.innerHTML += `<button type="button">Visit</button>`;

      modalSearch.appendChild(recommendationDiv);
    }
  } else {
    modalSearch.innerHTML = `<p class="recommendation" style="padding: 5vh; text-align: center;">No matching destination</p>`;
  }

  modalSearch.showModal();
}

function getTimeZoneByCity(cityName) {
  const formattedCity = cityName.trim().replace(/\s+/g, "_").toLowerCase(); // Standardize input: "new york" -> "New_York"
  const allZones = Intl.supportedValuesOf("timeZone"); // Get all supported IANA timezones (e.g., ["Africa/Abidjan", "America/New_York", ...])
  return allZones.find((zone) => zone.toLowerCase().endsWith(formattedCity)); // Find the first zone that ends with our city name
}

function getTimebyTimeZone(timeZone) {
  const options = { timeZone, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const timeString = new Date().toLocaleTimeString("en-US", options)
  return timeString;
}

btnSearch.addEventListener("click", searchKeyword);
btnClear.addEventListener("click", () => (keywordInput.value = ""));

modalSearch.addEventListener("click", (e) => {
  // console.log(e.target)
  if (e.target === modalSearch) {
    modalSearch.close();
    modalSearch.innerHTML = "";
    keywordInput.value = "";
    keywordInput.focus();
  }
});