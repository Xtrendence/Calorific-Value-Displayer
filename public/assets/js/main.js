document.addEventListener("DOMContentLoaded", () => {
	let divChartWrapper = document.getElementById("chart-wrapper");
	let divTableWrapper = document.getElementById("table-wrapper");

	let containerChart = document.getElementById("container-chart");
	let containerTable = document.getElementById("container-table");

	let buttonViewChart = document.getElementById("button-view-chart");
	let buttonViewTable = document.getElementById("button-view-table");

	let buttonPrevious = document.getElementById("button-previous");
	let buttonNext = document.getElementById("button-next");

	let inputFrom = document.getElementById("input-from");
	let inputTo = document.getElementById("input-to");

	let buttonAverage = document.getElementById("button-average");

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
		let currentFrom = parseInt(divChartWrapper.getAttribute("data-from"));
		let currentTo = parseInt(divChartWrapper.getAttribute("data-to"));

		if(currentFrom - 100 >= 0) {
			divChartWrapper.innerHTML = "<span>Loading...</span>";
			divTableWrapper.innerHTML = "<span>Loading...</span>";

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

	buttonAverage.addEventListener("click", async () => {
		let from = inputFrom.value;
		let to = inputTo.value;

		buttonAverage.innerText = "Loading...";

		let data = await fetchDataByDate(from, to);

		let values = [];
		data.map(item => {
			values.push(item?.calorificValue);
		});

		window.alert(`Average: ${average(values).toFixed(3)}`);

		buttonAverage.innerText = "Calculate Average";
	});

	const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

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
		divTableWrapper.innerHTML = `
			<div class="row header">
				<span class="applicable-for">Applicable For</span>
				<span class="calorific-value">Calorific Value</span>
				<span class="area">Area</span>
			</div>
		`;

		data.map(row => {
			divTableWrapper.innerHTML += `
				<div class="row">
					<span class="applicable-for">${row?.applicableFor}</span>
					<span class="calorific-value">${row?.calorificValue}</span>
					<span class="area">${row?.area}</span>
				</div>
			`;
		});
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

	function fetchDataByDate(from, to) {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();

			xhr.addEventListener("readystatechange", () => {
				if(xhr.readyState === XMLHttpRequest.DONE) {
					if(validJSON(xhr.responseText)) {
						resolve(JSON.parse(xhr.responseText));
						return;
					}

					reject("Invalid JSON response.");
				}
			});

			xhr.open("GET", `../api/data/read-date.php?from=${from}&to=${to}`, true);
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