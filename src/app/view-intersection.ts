import type { ScenarioConfig } from '@core';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface IntersectionViewOptions {
  /**
   * Size of the SVG viewBox in both directions.
   * We use a square viewBox [-halfSize, +halfSize] in both x and y.
   */
  logicalSize?: number;

  /** Stroke width in logical units for the road cross. */
  roadStrokeWidth?: number;
}

/**
 * Create a simple SVG “+” intersection placeholder for the given scenario.
 *
 * Phase 0:
 * - Ignores the detailed layout in ScenarioConfig.
 * - Renders a symmetric cross (horizontal + vertical bar) in the center.
 * - Uses a fixed viewBox so it scales nicely in the layout tab.
 */
export function createIntersectionSvg(
  _scenario: ScenarioConfig,
  options: IntersectionViewOptions = {},
): SVGSVGElement {
  const logicalSize = options.logicalSize ?? 100;
  const roadStrokeWidth = options.roadStrokeWidth ?? 18;

  const half = logicalSize / 2;

  // Root SVG
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `${-half} ${-half} ${logicalSize} ${logicalSize}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Intersection placeholder');
  svg.classList.add('intersection-svg');

  // Background (optional, just to ensure contrast)
  const background = document.createElementNS(SVG_NS, 'rect');
  background.setAttribute('x', String(-half));
  background.setAttribute('y', String(-half));
  background.setAttribute('width', String(logicalSize));
  background.setAttribute('height', String(logicalSize));
  background.setAttribute('fill', '#f4f4f4');
  svg.appendChild(background);

  // Common attributes for road bars
  const roadColor = '#333333';

  // Vertical bar
  const vertical = document.createElementNS(SVG_NS, 'rect');
  vertical.setAttribute('x', String(-roadStrokeWidth / 2));
  vertical.setAttribute('y', String(-half));
  vertical.setAttribute('width', String(roadStrokeWidth));
  vertical.setAttribute('height', String(logicalSize));
  vertical.setAttribute('fill', roadColor);
  svg.appendChild(vertical);

  // Horizontal bar
  const horizontal = document.createElementNS(SVG_NS, 'rect');
  horizontal.setAttribute('x', String(-half));
  horizontal.setAttribute('y', String(-roadStrokeWidth / 2));
  horizontal.setAttribute('width', String(logicalSize));
  horizontal.setAttribute('height', String(roadStrokeWidth));
  horizontal.setAttribute('fill', roadColor);
  svg.appendChild(horizontal);

  // Center marker (just a subtle dot)
  const centerDot = document.createElementNS(SVG_NS, 'circle');
  centerDot.setAttribute('cx', '0');
  centerDot.setAttribute('cy', '0');
  centerDot.setAttribute('r', String(roadStrokeWidth / 4));
  centerDot.setAttribute('fill', '#ffffff');
  centerDot.setAttribute('stroke', '#000000');
  centerDot.setAttribute('stroke-width', '1');
  svg.appendChild(centerDot);

  return svg;
}
