import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Canvas/Fabric
vi.mock('fabric', () => {
  class MockCanvas {
    on = vi.fn();
    off = vi.fn();
    dispose = vi.fn();
    setDimensions = vi.fn();
    setZoom = vi.fn();
    getObjects = vi.fn().mockReturnValue([]);
    add = vi.fn();
    requestRenderAll = vi.fn();
    discardActiveObject = vi.fn();
    getActiveObject = vi.fn();
    getZoom = vi.fn().mockReturnValue(1);
  }

  // Mock Prototype Chain for FabricObject/ActiveSelection
  const MockFabricObject = vi.fn();
  MockFabricObject.prototype = {};

  const MockActiveSelection = vi.fn();
  MockActiveSelection.prototype = {};

  return {
    Canvas: MockCanvas,
    Textbox: vi.fn(),
    FabricImage: vi.fn(),
    Rect: vi.fn(),
    Group: vi.fn(),
    Shadow: vi.fn(),
    FabricObject: MockFabricObject,
    ActiveSelection: MockActiveSelection,
    loadSVGFromURL: vi.fn(),
  };
})
