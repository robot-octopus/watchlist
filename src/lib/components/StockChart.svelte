<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import * as d3 from 'd3';

  export let data: Array<{ date: Date; price: number; volume?: number; symbol: string }> = [];
  export let height: number = 500;

  let containerElement: HTMLDivElement;
  let svgElement: SVGSVGElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let mounted = false;
  let containerWidth = 0;

  // Chart dimensions and margins
  $: margin = { top: 40, right: 20, bottom: 110, left: 60 };
  $: margin2 = { top: height - 70, right: 20, bottom: 30, left: 60 };
  $: chartWidth = Math.max(0, containerWidth - margin.left - margin.right);
  $: chartHeight = height - margin.top - margin.bottom;
  $: contextHeight = height - margin2.top - margin2.bottom;

  // Group data by symbol
  $: dataBySymbol = data.reduce(
    (acc, point) => {
      if (!acc[point.symbol]) {
        acc[point.symbol] = [];
      }
      const symbolData = acc[point.symbol];
      if (symbolData) {
        symbolData.push(point);
      }
      return acc;
    },
    {} as Record<string, typeof data>
  );

  $: symbols = Object.keys(dataBySymbol);
  $: colorScale = d3
    .scaleOrdinal()
    .domain(symbols)
    .range([
      '#2563eb',
      '#dc2626',
      '#059669',
      '#7c3aed',
      '#ea580c',
      '#0891b2',
      '#be185d',
      '#4338f4',
    ]);

  let x: d3.ScaleTime<number, number>;
  let x2: d3.ScaleTime<number, number>;
  let y: d3.ScaleLinear<number, number>;
  let y2: d3.ScaleLinear<number, number>;
  let line: d3.Line<{ date: Date; price: number; symbol: string }>;
  let line2: d3.Line<{ date: Date; price: number; symbol: string }>;
  let brush: d3.BrushBehavior<unknown>;
  let zoom: d3.ZoomBehavior<Element, unknown>;

  let focus: d3.Selection<SVGGElement, unknown, null, undefined>;
  let context: d3.Selection<SVGGElement, unknown, null, undefined>;
  let lineChart: d3.Selection<SVGGElement, unknown, null, undefined>;
  let legend: d3.Selection<SVGGElement, unknown, null, undefined>;

  let resizeObserver: ResizeObserver;
  let isInitialized = false;
  let isUpdatingFromZoom = false;
  let isUpdatingFromBrush = false;

  onMount(async () => {
    mounted = true;
    await tick();
    updateContainerWidth();
    setupResizeObserver();
    if (data.length > 0 && chartWidth > 0) {
      initChart();
    }
  });

  onDestroy(() => {
    mounted = false;
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  function updateContainerWidth() {
    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      const newWidth = rect.width;
      if (newWidth > 0) {
        containerWidth = newWidth;
        return true;
      }
    }
    return false;
  }

  function setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && containerElement) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          if (newWidth > 0 && Math.abs(newWidth - containerWidth) > 1) {
            containerWidth = newWidth;
            if (isInitialized) {
              resize();
            }
          }
        }
      });
      resizeObserver.observe(containerElement);
    }
  }

  // Initialize chart when data or dimensions are ready
  $: if (mounted && data.length > 0 && chartWidth > 0 && !isInitialized) {
    initChart();
  }

  // Update chart when data changes
  $: if (mounted && isInitialized && data.length > 0) {
    updateChart();
  }

  // Resize when dimensions change
  $: if (mounted && chartWidth > 0 && isInitialized && containerWidth > 0) {
    resize();
  }

  function initChart() {
    if (!svgElement || chartWidth <= 0) return;

    svg = d3.select(svgElement);
    svg.selectAll('*').remove();

    // Set initial SVG dimensions
    svg.attr('width', containerWidth).attr('height', height);

    // Initialize scales
    x = d3.scaleTime().range([0, chartWidth]);
    x2 = d3.scaleTime().range([0, chartWidth]);
    y = d3.scaleLinear().range([chartHeight, 0]);
    y2 = d3.scaleLinear().range([contextHeight, 0]);

    // Line generators
    line = d3
      .line<{ date: Date; price: number; symbol: string }>()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    line2 = d3
      .line<{ date: Date; price: number; symbol: string }>()
      .x((d) => x2(d.date))
      .y((d) => y2(d.price))
      .curve(d3.curveMonotoneX);

    // Brush
    brush = d3
      .brushX()
      .extent([
        [0, 0],
        [chartWidth, contextHeight],
      ])
      .on('brush end', brushed);

    // Zoom
    zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .extent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .on('zoom', zoomed);

    // Clip path
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', `clip-chart`)
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    // Create groups
    lineChart = svg
      .append('g')
      .attr('class', 'line-chart')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('clip-path', `url(#clip-chart)`);

    focus = svg
      .append('g')
      .attr('class', 'focus')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    context = svg
      .append('g')
      .attr('class', 'context')
      .attr('transform', `translate(${margin2.left},${margin2.top})`);

    legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left}, 10)`);

    svg
      .append('rect')
      .attr('class', 'zoom')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(zoom);

    isInitialized = true;
    updateChart();
  }

  function resize() {
    if (!svg || !isInitialized || chartWidth <= 0) return;

    // Update SVG dimensions
    svg.attr('width', containerWidth).attr('height', height);

    // Update scale ranges
    x.range([0, chartWidth]);
    x2.range([0, chartWidth]);

    // Update brush extent
    brush.extent([
      [0, 0],
      [chartWidth, contextHeight],
    ]);

    // Update zoom extent
    zoom
      .translateExtent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .extent([
        [0, 0],
        [chartWidth, chartHeight],
      ]);

    // Update clip path
    svg.select(`#clip-chart rect`).attr('width', chartWidth).attr('height', chartHeight);

    // Update zoom rect
    svg.select('.zoom').attr('width', chartWidth).attr('height', chartHeight);

    // Redraw everything
    updateChart();
  }

  function updateChart() {
    if (
      !mounted ||
      !svg ||
      data.length === 0 ||
      chartWidth <= 0 ||
      !isInitialized ||
      symbols.length === 0
    )
      return;

    // Set domains based on all data
    const extent = d3.extent(data, (d) => d.date) as [Date, Date];
    const priceExtent = d3.extent(data, (d) => d.price) as [number, number];
    const padding = (priceExtent[1] - priceExtent[0]) * 0.1;

    x.domain(extent);
    y.domain([priceExtent[0] - padding, priceExtent[1] + padding]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    // Update/create lines for each symbol in main chart
    const mainLines = lineChart.selectAll('.symbol-line').data(symbols);

    mainLines
      .enter()
      .append('path')
      .attr('class', 'symbol-line')
      .merge(mainLines)
      .attr('d', (symbol) => {
        const symbolData = dataBySymbol[symbol];
        return symbolData ? line(symbolData) : null;
      })
      .attr('stroke', (d) => colorScale(d))
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .style('stroke-opacity', 1);

    mainLines.exit().remove();

    // Update/create lines for each symbol in context chart
    const contextLines = context.selectAll('.symbol-line').data(symbols);

    contextLines
      .enter()
      .append('path')
      .attr('class', 'symbol-line')
      .merge(contextLines)
      .attr('d', (symbol) => line2(dataBySymbol[symbol]))
      .attr('stroke', (d) => colorScale(d))
      .attr('stroke-width', 1)
      .attr('fill', 'none');

    contextLines.exit().remove();

    // Update axes
    const xAxis = d3.axisBottom(x);
    const xAxis2 = d3.axisBottom(x2);
    const yAxis = d3.axisLeft(y).tickFormat(d3.format('$.2f'));

    // Main chart axes
    focus.selectAll('.axis--x').remove();
    focus.selectAll('.axis--y').remove();

    focus
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    focus.append('g').attr('class', 'axis axis--y').call(yAxis);

    // Context chart axis
    context.selectAll('.axis--x').remove();
    context
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${contextHeight})`)
      .call(xAxis2);

    // Update brush
    context.selectAll('.brush').remove();
    context.append('g').attr('class', 'brush').call(brush).call(brush.move, x.range());

    // Update legend
    updateLegend();
  }

  function updateLegend() {
    if (!legend || symbols.length <= 1) {
      legend.selectAll('*').remove();
      return;
    }

    const legendItems = legend.selectAll('.legend-item').data(symbols);

    const legendEnter = legendItems.enter().append('g').attr('class', 'legend-item');

    legendEnter
      .append('line')
      .attr('class', 'legend-line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0);

    legendEnter
      .append('text')
      .attr('class', 'legend-text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em');

    const legendUpdate = legendEnter.merge(legendItems);

    legendUpdate
      .select('.legend-line')
      .attr('stroke', (d) => colorScale(d))
      .attr('stroke-width', 2);

    legendUpdate
      .select('.legend-text')
      .text((d) => d)
      .style('font-size', '12px')
      .style('fill', 'currentColor');

    // Position legend items horizontally
    legendUpdate.attr('transform', (d, i) => `translate(${i * 80}, 0)`);

    legendItems.exit().remove();
  }

  function brushed(event: any) {
    if (isUpdatingFromZoom) return;
    if (event.sourceEvent && event.sourceEvent.type === 'zoom') return;
    if (!event.selection) return;

    isUpdatingFromBrush = true;

    const selection = event.selection;
    x.domain(selection.map(x2.invert, x2));

    // Update all lines
    lineChart.selectAll('.symbol-line').attr('d', (symbol) => line(dataBySymbol[symbol]));

    focus.select('.axis--x').call(d3.axisBottom(x));

    // Update zoom transform
    const transform = d3.zoomIdentity
      .scale(chartWidth / (selection[1] - selection[0]))
      .translate(-selection[0], 0);

    svg.select('.zoom').call(zoom.transform, transform);

    isUpdatingFromBrush = false;
  }

  function zoomed(event: any) {
    if (isUpdatingFromBrush) return;
    if (event.sourceEvent && event.sourceEvent.type === 'brush') return;
    if (!event.transform) return;

    isUpdatingFromZoom = true;

    const transform = event.transform;
    x.domain(transform.rescaleX(x2).domain());

    // Update all lines
    lineChart.selectAll('.symbol-line').attr('d', (symbol) => line(dataBySymbol[symbol]));

    focus.select('.axis--x').call(d3.axisBottom(x));

    // Update brush selection
    const brushSelection = x.range().map(transform.invertX, transform);
    context.select('.brush').call(brush.move, brushSelection);

    isUpdatingFromZoom = false;
  }
</script>

<div class="stock-chart-container" bind:this={containerElement}>
  <svg bind:this={svgElement} class="stock-chart-svg"></svg>
</div>

<style>
  .stock-chart-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;
    background: #1a1c26;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .stock-chart-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  :global(.stock-chart-container .line) {
    fill: none;
    stroke: #2563eb;
    stroke-width: 2px;
  }

  :global(.stock-chart-container .context .line) {
    stroke: #94a3b8;
    stroke-width: 1px;
  }

  :global(.stock-chart-container .zoom) {
    cursor: move;
    fill: none;
    pointer-events: all;
  }

  :global(.stock-chart-container .brush .overlay) {
    cursor: crosshair;
  }

  :global(.stock-chart-container .brush .selection) {
    fill: #2563eb;
    fill-opacity: 0.2;
    stroke: #2563eb;
    stroke-width: 1px;
  }

  :global(.stock-chart-container .axis) {
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    font-size: 12px;
  }

  :global(.stock-chart-container .axis text) {
    fill: #374151;
  }

  :global(.stock-chart-container .axis line),
  :global(.stock-chart-container .axis path) {
    fill: none;
    stroke: #d1d5db;
    stroke-width: 1px;
  }

  :global(.stock-chart-container .chart-title) {
    fill: #1f2937;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  :global(.stock-chart-container .y-axis-label) {
    fill: #6b7280;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  /* Consistent dark background for all modes */

  :global(.dark .stock-chart-container .line) {
    stroke: #60a5fa;
  }

  :global(.dark .stock-chart-container .context .line) {
    stroke: #6b7280;
  }

  :global(.dark .stock-chart-container .brush .selection) {
    fill: #60a5fa;
    stroke: #60a5fa;
  }

  :global(.dark .stock-chart-container .axis text) {
    fill: #d1d5db;
  }

  :global(.dark .stock-chart-container .axis line),
  :global(.dark .stock-chart-container .axis path) {
    stroke: #4b5563;
  }

  :global(.dark .stock-chart-container .chart-title) {
    fill: #f9fafb;
  }

  :global(.dark .stock-chart-container .y-axis-label) {
    fill: #9ca3af;
  }
</style>
