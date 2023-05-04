const chart = document.getElementById('chart');

const CHART_WIDTH = 500;
const CHART_HEIGHT = 100;
const SCALE_HEIGHT_MULTIPLIER = 3;
let RESPONSE_DATA;

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
	.then(result => result.json())
	.then(response => {
		document.getElementById('title').innerText = (response.name || '').replace(', 1 Decimal', '');
		RESPONSE_DATA = response.data;

		console.log(response.data);

		attachGraph();
	});


function attachGraph() {
	// Set the dimensions of the canvas
	const margin = {
		top: 20,
		right: 20,
		bottom: 70,
		left: 40
	};
	const width = 800 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;

	// Set the ranges
	const x = d3.scaleTime()
		.range([0, width])

	const y = d3.scaleLinear()
		.range([height, 0]);

	const barWidth = (width - 1 )/ RESPONSE_DATA.length;

	// Create the canvas
	const svg = d3.select('#chart')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Format the data
	RESPONSE_DATA.map(arr => {
		arr.date = arr[0];
		arr.value = arr[1];
	});

	// Scale the range of the data
	x.domain([
		new Date(d3.min(RESPONSE_DATA, (d) => d[0])),
		new Date(d3.max(RESPONSE_DATA, (d) => d[0]))
	])
	y.domain([0, d3.max(RESPONSE_DATA, d => d.value )]);

	// Add the bars
	svg.selectAll('.bar')
		.data(RESPONSE_DATA)
		.enter()
		.append('rect')
		.attr('class', 'bar')
		.attr("x", (d, i) => (i * barWidth) + 1)
		.attr("width", barWidth)
		.attr('y', d => y(d.value) )
		.attr('height', d => height - y(d.value))
		.attr('fill', 'rgb(51, 173, 255)')
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseleave', mouseleave)

	// Add the x axis
	svg.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(x));

	// Add the y axis
	svg.append('g')
		.call(d3.axisLeft(y));

	// Create a tooltip div element
  const toolTip = d3.select('.tooltip-wrapper')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')

	function mouseover() {
		toolTip.style('opacity', 1)

		d3.select(this)
			.style('fill', 'black')
			.style('opacity', 1)
	}

	function mousemove(d) {
		const data = d.target.__data__
		const date = data.date;
		const dollars = data.value;
		const formattedDate = new Date(date).toLocaleDateString('en-us', {
			year:'numeric',
			month:'short',
			day:'numeric'
		});

		const formattedDollars = Math.abs(dollars).toFixed(2);

		toolTip
			.html(`${formattedDate} -- $${formattedDollars} Billion`)
			.style('visibility', 'visible')
			.style('left', (d3.pointer(this)[0]) + 70 + 'px')
			.style('top', (d3.pointer(this)[1]) + 'px')
	}

	function mouseleave() {
		d3.select(this).style('fill', 'rgb(51, 173, 255)');

		toolTip
			.style('visibility', 'hidden')
	}
}
