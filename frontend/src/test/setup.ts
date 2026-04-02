import '@testing-library/jest-dom';

// @dnd-kit needs these in jsdom
window.PointerEvent = window.PointerEvent ?? MouseEvent as any;
HTMLElement.prototype.setPointerCapture = HTMLElement.prototype.setPointerCapture ?? vi.fn();
HTMLElement.prototype.releasePointerCapture = HTMLElement.prototype.releasePointerCapture ?? vi.fn();
HTMLElement.prototype.hasPointerCapture = HTMLElement.prototype.hasPointerCapture ?? vi.fn();