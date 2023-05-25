const data = [
	{ hour: "00:00", temp: 69 },
	{ hour: "01:00", temp: 17 },
	{ hour: "02:00", temp: 25 },
	{ hour: "03:00", temp: 10 },
	{ hour: "04:00", temp: 25 },
	{ hour: "05:00", temp: 69 },
	{ hour: "06:00", temp: 20 },
	{ hour: "07:00", temp: 69 },
	{ hour: "08:00", temp: 69 },
	{ hour: "09:00", temp: 69 },
	{ hour: "10:00", temp: 40 },
	{ hour: "11:00", temp: 69 },
	{ hour: "12:00", temp: 69 },
	{ hour: "13:00", temp: 69 },
	{ hour: "14:00", temp: 20 },
	{ hour: "15:00", temp: 69 },
	{ hour: "16:00", temp: 69 },
	{ hour: "17:00", temp: 69 },
	{ hour: "18:00", temp: 69 },
	{ hour: "19:00", temp: 69 },
	{ hour: "20:00", temp: 69 },
	{ hour: "21:00", temp: 69 },
	{ hour: "22:00", temp: 69 },
	{ hour: "23:00", temp: -100 }
];

const config = {
	type: "line",
	data: {
		labels: data.map(row => row.hour),
		datasets: [
			{
				pointStyle: false,
				data: data.map(row => row.temp),
				borderWidth: 1,
				borderColor: "rgb(116, 116, 116)"
			}
		]
	},
	options: {
		scales: {
			y: {
				display: false,
				max: 100,
				min: -100
			},
			x: {
				grid: {
					display: false
				},
				afterBuildTicks: axis =>
					(axis.ticks = [
						"00:00",
						"04:00",
						"08:00",
						"12:00",
						"16:00",
						"20:00"
					].map(value => ({ value }))),
				ticks: {
					color: "#f0f0f0",
					major: true
				},
				border: {
					color: "rgb(116, 116, 116)"
				}
			}
		},
		plugins: {
			legend: {
				display: false
			}
		}
	}
};

new Chart(document.getElementById("hourly-chart"), config);
