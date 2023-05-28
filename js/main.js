import { $ } from "./utils/general.js";
import { API_KEY, API_URL } from "./utils/api.js";
import AOS from "./vendor/aos.js";

(function() {
	AOS.init({
		disable: "mobile"
	});
})();

Date.prototype.yyyymmdd = function() {
	let month = this.getMonth() + 1; // getMonth() is zero-based
	let day = this.getDate();

	return [
		this.getFullYear(),
		(month > 9 ? "" : "0") + month,
		(day > 9 ? "" : "0") + day
	].join("-");
};

const locationGrantBtn = $.getElementById("grantPerm"),
	tempUnits = $.querySelectorAll(".temp-units"),
	searchInputLabel = $.getElementById("searchLabel"),
	searchInput = $.getElementById("search");
let weatherChart = null;

locationGrantBtn.addEventListener("click", handleUserLocation);
searchInputLabel.addEventListener("click", function() {
	handleInputValue(searchInput);
});
searchInput.addEventListener("keydown", function(e) {
	if (e.key === "Enter") {
		handleInputValue(this);
	}
});

function handleInputValue(input) {
	if (input.value.trim() !== "" && isNaN(+input.value)) {
		fetchWeatherData(input.value);
		input.value = "";
	}
}

function handleUserLocation() {
	navigator.geolocation.getCurrentPosition(
		({ coords: { latitude, longitude } }) => {
			fetchWeatherData(`${latitude},${longitude}`);
		},
		err => {
			console.log(err);
		}
	);
}

function fetchWeatherData(query = "") {
	fetch(`${API_URL}/forecast.json?key=${API_KEY}&q=${query}&days=10`, {
		headers: {
			"Content-Type": "application/json"
		}
	})
		.then(response => response.json())
		.then(data => {
			// c is the acronym of celsius
			insertWeaherDataIntoDom(data, "c");

			tempUnits.forEach(element => {
				element.addEventListener("click", () => {
					// remove "active-text" from both
					tempUnits.forEach(elem => elem.classList.remove("active-text"));
					element.classList.add("active-text");
					insertWeaherDataIntoDom(data, element.dataset.temp);
				});
			});
		})
		.catch(console.log);
}

function insertWeaherDataIntoDom(data, tempUnit) {
	const { country, name } = data.location,
		currentWeather = data.current,
		forecasts = data.forecast.forecastday;

	document.getElementById("locationName").textContent = `${name}, ${country}`;
	document.getElementById("temp").textContent = Math.floor(
		currentWeather[`temp_${tempUnit}`]
	);
	document.getElementById("weatherCond").textContent =
		currentWeather.condition.text;
	document.getElementById("realFeel").textContent = Math.floor(
		currentWeather[`feelslike_${tempUnit}`]
	);
	document.getElementById("windSpeed").textContent = Math.floor(
		currentWeather.wind_mph
	);
	document.getElementById("visability").textContent = Math.floor(
		currentWeather.vis_miles
	);
	document.getElementById("humidity").textContent = Math.floor(
		currentWeather.humidity
	);
	document.getElementById("pressure").textContent = Math.floor(
		currentWeather.pressure_in
	);

	createForecastElements(forecasts, tempUnit);
}

function createForecastElements(forecasts = [], tempUnit = "") {
	const forecastsContainer = $.getElementById("forecasts"),
		fragment = $.createDocumentFragment();

	let weatherForecastElem = $.createElement("div"),
		forecastDate = null;

	function handleForecastElementClasses(clickedForecastElem) {
		forecastsContainer
			.querySelectorAll(".weather-forecasts-wrapper__forecast")
			.forEach(element => element.classList.remove("active"));
		clickedForecastElem.classList.add("active");
	}

	for (let {
		day: dailyForecast,
		date_epoch,
		hour: hourlyForecast
	} of forecasts) {
		// toDateString() returns "${dayOfWeek} ${month} ${dayOfMonth} ${year}"
		forecastDate = new Date(date_epoch * 1000).toDateString().split(" ");

		weatherForecastElem.className = `weather-forecasts-wrapper__forecast ${+forecastDate[2] ===
		new Date().getDate()
			? "active"
			: ""}`;
		weatherForecastElem.dataset.aos = "fade-up";
		weatherForecastElem.innerHTML = `
		<p class="forecast__date">${forecastDate[0]} ${forecastDate[2]}</p>
		<img src="${dailyForecast.condition
			.icon}" class="forecast__img" alt="Weather Icon">
		<div class="forecast__temps flex">
			<div class="temps__max-temp">
				<span class="max-temp">${Math.floor(
					dailyForecast[`maxtemp_${tempUnit}`]
				)}</span>&#176;
			</div>
			<div class="temps__min-temp">
				<span class="min-temp">${Math.floor(
					dailyForecast[`mintemp_${tempUnit}`]
				)}</span>&#176;
			</div>
		</div>
		<p class="forecast__weather-condition">${dailyForecast.condition.text}</p>
		`;

		fragment.append(weatherForecastElem);
		weatherForecastElem.addEventListener("click", function() {
			createDataForChart(hourlyForecast, tempUnit);
			handleForecastElementClasses(this);
		});
		weatherForecastElem = weatherForecastElem.cloneNode(true);
	}

	forecastsContainer.innerHTML = "";

	forecastsContainer.append(fragment);
	createDataForChart(getTodayHourlyForecast(forecasts), tempUnit);
}

function getTodayHourlyForecast(forecasts) {
	return forecasts.find(forecast => forecast.date === new Date().yyyymmdd())
		.hour;
}

function createDataForChart(hourlyForecasts, tempUnit) {
	const hourlyData = [];

	for (let hourlyForecast of hourlyForecasts) {
		hourlyData.push({
			hour: hourlyForecast.time.split(" ")[1],
			temp: hourlyForecast[`temp_${tempUnit}`],
			condition: {
				icon: hourlyForecast.condition.icon,
				text: hourlyForecast.condition.text
			}
		});
	}

	drawHourlyTempChart(hourlyData, tempUnit);
}

function drawHourlyTempChart(data = [], tempUnit = "") {
	if (weatherChart) {
		weatherChart.destroy();
	}

	const scalesOption = {
		grid: {
			display: false
		},
		ticks: {
			color: "#f0f0f0"
		},
		border: {
			color: "rgb(116, 116, 116)"
		}
	};

	const config = {
		type: "line",
		data: {
			labels: data.map(row => row.hour),
			datasets: [
				{
					data: data.map(row => row.temp),
					borderWidth: 2,
					borderColor: "rgb(116, 116, 116)",
					pointRadius: 3
				}
			]
		},
		options: {
			interaction: {
				intersect: false,
				mode: "index"
			},
			scales: {
				y: {
					...scalesOption,
					title: {
						display: true,
						color: "#f0f0f0",
						text: `°${tempUnit.toUpperCase()}`
					}
				},
				x: {
					...scalesOption,
					afterBuildTicks: axis =>
						(axis.ticks = [
							"00:00",
							"04:00",
							"08:00",
							"12:00",
							"16:00",
							"20:00"
						].map(value => ({ value })))
				}
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: false,
					external: function(context) {
						// Tooltip Element
						let tooltipEl = document.getElementById("chartjs-tooltip");

						// Create element on first render
						if (!tooltipEl) {
							tooltipEl = document.createElement("div");
							tooltipEl.id = "chartjs-tooltip";
							tooltipEl.innerHTML = "<table></table>";
							document.body.appendChild(tooltipEl);
						}

						// Hide if no tooltip
						const tooltipModel = context.tooltip;
						if (tooltipModel.opacity === 0) {
							tooltipEl.style.opacity = 0;
							return;
						}

						// Set caret Position
						tooltipEl.classList.remove("above", "below", "no-transform");
						if (tooltipModel.yAlign) {
							tooltipEl.classList.add(tooltipModel.yAlign);
						} else {
							tooltipEl.classList.add("no-transform");
						}

						function getBodyLines(bodyItem) {
							return bodyItem.lines;
						}

						function getBodyBefore(bodyItem) {
							bodyItem.before.push(
								`<img alt="Weather Icon" src="${data[
									tooltipModel.dataPoints[0].dataIndex
								].condition.icon}"/>`
							);
							return bodyItem.before;
						}

						// Set Text
						if (tooltipModel.body) {
							const titleLines = tooltipModel.title || [];
							const bodyLines = tooltipModel.body.map(getBodyLines);
							const bodyBefore = tooltipModel.body.map(getBodyBefore);

							let innerHtml = "<thead>";

							titleLines.forEach(function(title) {
								innerHtml += "<tr><th>" + title + "</th></tr>";
							});
							innerHtml += "</thead><tbody>";

							bodyBefore.forEach(function(body, i) {
								const span = "<span>" + body + "</span>";
								innerHtml += "<tr><td>" + span + "</td></tr>";
							});
							bodyLines.forEach(function(body, i) {
								const colors = tooltipModel.labelColors[i];
								let style = `background:" "${colors.backgroundColor}";border-color:"${colors.borderColor}"; border-width: "2px"`;
								const span = `<span style="${style}">${body}°${tempUnit.toUpperCase()}</span>`;
								innerHtml += "<tr><td>" + span + "</td></tr>";
							});

							innerHtml += "</tbody>";

							let tableRoot = tooltipEl.querySelector("table");
							tableRoot.innerHTML = innerHtml;
						}
						const position = context.chart.canvas.getBoundingClientRect();
						const bodyFont = Chart.helpers.toFont(
							tooltipModel.options.bodyFont
						);

						// setting Padding
						tooltipModel.padding = "8";
						// Display, position, and set styles for font
						tooltipEl.style.opacity = 1;
						tooltipEl.style.position = "absolute";
						tooltipEl.style.left =
							position.left +
							window.pageXOffset +
							tooltipModel.caretX -
							tooltipEl.offsetWidth +
							"px";
						tooltipEl.style.top =
							position.top +
							window.scrollY +
							tooltipModel.caretY -
							tooltipEl.offsetHeight +
							"px";
						tooltipEl.style.font = bodyFont.string;
						tooltipEl.style.padding =
							tooltipModel.padding + "px " + tooltipModel.padding + "px";
						tooltipEl.style.pointerEvents = "none";
						tooltipEl.style.backgroundColor = "rgba(0,0,0,.7)";
						tooltipEl.style.borderRadius = "5px";
					}
				}
			}
		}
	};
	weatherChart = new Chart(document.getElementById("hourly-chart"), config);
}
