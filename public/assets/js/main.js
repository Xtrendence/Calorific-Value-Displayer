document.addEventListener("DOMContentLoaded", () => {
	let divChartWrapper = document.getElementById("chart-wrapper");
	let divTableWrapper = document.getElementById("table-wrapper");

	let containerChart = document.getElementById("container-chart");
	let containerTable = document.getElementById("container-table");

	let buttonViewChart = document.getElementById("button-view-chart");
	let buttonViewTable = document.getElementById("button-view-table");

	let buttonPrevious = document.getElementById("button-previous");
	let buttonNext = document.getElementById("button-next");

	displayData(0, 99);

	buttonViewChart.addEventListener("click", () => {
		containerChart.classList.remove("hidden");
		containerTable.classList.add("hidden");
		buttonViewChart.classList.add("active");
		buttonViewTable.classList.remove("active");
	});

	buttonViewTable.addEventListener("click", () => {
		containerChart.classList.add("hidden");
		containerTable.classList.remove("hidden");
		buttonViewChart.classList.remove("active");
		buttonViewTable.classList.add("active");
	});

	buttonPrevious.addEventListener("click", () => {
		divChartWrapper.innerHTML = "<span>Loading...</span>";
		divTableWrapper.innerHTML = "<span>Loading...</span>";

		let currentFrom = parseInt(divChartWrapper.getAttribute("data-from"));
		let currentTo = parseInt(divChartWrapper.getAttribute("data-to"));

		if(currentFrom - 100 >= 0) {
			displayData(currentFrom - 100, currentTo - 100);
		}
	});

	buttonNext.addEventListener("click", () => {
		divChartWrapper.innerHTML = "<span>Loading...</span>";
		divTableWrapper.innerHTML = "<span>Loading...</span>";

		let currentFrom = parseInt(divChartWrapper.getAttribute("data-from"));
		let currentTo = parseInt(divChartWrapper.getAttribute("data-to"));

		displayData(currentFrom + 100, currentTo + 100);
	});

	async function displayData(from, to) {
		let data = await fetchData(from, to);
		let parsed = parseData(data);
		generateChart(parsed.labels, parsed.values);
		generateTable(data);
	}

	function parseData(data) {
		let labels = [];
		let values = [];

		data.map(item => {
			labels.push(item?.applicableFor);
			values.push(item?.calorificValue);
		});

		return { labels:labels, values:values };
	}

	function generateChart(labels, data) {
		let canvas = document.createElement("canvas");
		canvas.classList.add("chart");

		new Chart(canvas, {
			type: "line",
			data: {
				labels: labels,
				datasets: [{
					label: "Calorific Value Data",
					backgroundColor: "rgba(0,0,0,0)",
					borderColor: "rgb(0,125,255)",
					data: data
				}],
			},
			options: {
				responsive: true,
				legend: {
					display: true
				},
				scales: {
					xAxes: [{
						gridLines: {
							color: "rgba(0,0,0,0.2)",
							borderDash: [8, 4]
						}
					}],
					yAxes: [{
						gridLines: {
							color: "rgba(0,0,0,0.2)",
							borderDash: [8, 4]
						},
						ticks: {
							stepSize: 5
						}
					}]
				}
			}
		});

		divChartWrapper.innerHTML = "";
		divChartWrapper.appendChild(canvas);
	}

	function generateTable(data) {
		
	}

	function fetchData(from, to) {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();

			xhr.addEventListener("readystatechange", () => {
				if(xhr.readyState === XMLHttpRequest.DONE) {
					if(validJSON(xhr.responseText)) {
						divChartWrapper.setAttribute("data-from", from);
						divChartWrapper.setAttribute("data-to", to);
						resolve(JSON.parse(xhr.responseText));
						return;
					}

					reject("Invalid JSON response.");
				}
			});

			xhr.open("GET", `../api/data/read.php?from=${from}&to=${to}`, true);
			xhr.send();
		});
	}
});

function empty(string) {
	if (string != null && typeof string != "undefined" && string.toString().trim() != "" && JSON.stringify(string) != "" && JSON.stringify(string) != "{}") {
		return false;
	}
	return true;
}

function validJSON(json) {
	try {
		let object = JSON.parse(json);
		if (object && typeof object === "object") {
			return object;
		}
	}
	catch (e) { }
	return false;
}