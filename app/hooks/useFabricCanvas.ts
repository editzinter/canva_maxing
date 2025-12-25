import { useRef, useCallback, useEffect } from "react";
import {
  Canvas,
  Textbox,
  FabricImage,
  FabricObject,
  util,
  Rect,
  Pattern,
  Gradient,
  Shadow,
} from "fabric";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "@/app/editor/components/FabricCanvas";


// Font family mapping for Fabric.js
// Font family mapping for Fabric.js
const FONT_MAP: Record<string, string> = {
  // Sans Serif
  "font-manrope": "Manrope",
  "font-inter": "Inter",
  "font-outfit": "Outfit",
  "font-dm-sans": "DM Sans",
  "font-space": "Space Grotesk",
  "font-archivo": "Archivo",
  "font-tenor": "Tenor Sans",
  "font-roboto": "Roboto",
  "font-montserrat": "Montserrat",
  "font-open-sans": "Open Sans",
  "font-lato": "Lato",
  "font-poppins": "Poppins",
  "font-raleway": "Raleway",

  // Serif
  "font-bodoni": "Bodoni Moda",
  "font-prata": "Prata",
  "font-cormorant": "Cormorant Garamond",
  "font-dm-serif": "DM Serif Display",
  "font-libre": "Libre Baskerville",
  "font-playfair": "Playfair Display",
  "font-merriweather": "Merriweather",
  "font-lora": "Lora",
  "font-cinzel": "Cinzel",
  "font-abril-fatface": "Abril Fatface",

  // Display
  "font-syne": "Syne",
  "font-italiana": "Italiana",
  "font-julius": "Julius Sans One",
  "font-marcellus": "Marcellus",
  "font-forum": "Forum",
  "font-bebas": "Bebas Neue",
  "font-oswald": "Oswald",
  "font-lobster": "Lobster",
  "font-permanent-marker": "Permanent Marker",

  // Script
  "font-pinyon": "Pinyon Script",
  "font-alex": "Alex Brush",
  "font-mrs-saint": "Mrs Saint Delafield",
  "font-great-vibes": "Great Vibes",
  "font-dancing-script": "Dancing Script",
  "font-pacifico": "Pacifico",
};

export interface CanvasItemData {
  id: string;
  type: "text" | "image";
  content: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  textAlign?: string;
  opacity?: number;
}

export function useFabricCanvas(
  canvasRef: React.MutableRefObject<Canvas | null>,
) {
  const addText = useCallback(
    (type: "headline" | "subhead" | "body", content?: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      let fontSize = 16;
      let fontFamily = "Manrope";
      let fill = "#ffffff";
      let text = content || "New Text";

      if (type === "headline") {
        fontSize = 72;
        fontFamily = "Bebas Neue";
        fill = "#d9f99d"; // lime-300
        text = content || "New Headline";
      } else if (type === "subhead") {
        fontSize = 24;
        fontFamily = "Manrope";
        fill = "#ffffff";
        text = content || "New Subheading";
      } else {
        fontSize = 14;
        fontFamily = "Manrope";
        fill = "#d4d4d4"; // neutral-300
        text = content || "Add your body text here";
      }

      const textbox = new Textbox(text, {
        left: 100,
        top: 300 + Math.random() * 100,
        width: 400,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: fill,
        textAlign: "center",
        editable: true,
        selectable: true,
      });

      // Store a unique ID for tracking
      (textbox as any).customId = `text-${Date.now()}`;

      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.requestRenderAll();

      return (textbox as any).customId;
    },
    [canvasRef],
  );

  const addImage = useCallback(
    async (src: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      try {
        const img = await FabricImage.fromURL(src, {
          crossOrigin: "anonymous",
        });

        // Scale image to reasonable size
        const maxWidth = 200;
        const maxHeight = 200;
        const scale = Math.min(
          maxWidth / img.width!,
          maxHeight / img.height!,
          1,
        );

        img.set({
          left: 200,
          top: 200,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
        });

        (img as any).customId = `img-${Date.now()}`;

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();

        return (img as any).customId;
      } catch (error) {
        console.error("Failed to load image:", error);
        return null;
      }
    },
    [canvasRef],
  );

  const updateFontFamily = useCallback(
    (fontClass: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject || !(activeObject instanceof Textbox)) return;

      const fabricFont = FONT_MAP[fontClass] || "Manrope";
      activeObject.set("fontFamily", fabricFont);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const updateTextAlign = useCallback(
    (align: "left" | "center" | "right") => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject || !(activeObject instanceof Textbox)) return;

      activeObject.set("textAlign", align);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const updateFillColor = useCallback(
    (color: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject) return;

      activeObject.set("fill", color);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const updateFontSize = useCallback(
    (size: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeObject = canvas.getActiveObject();
      if (!activeObject || !(activeObject instanceof Textbox)) return;

      activeObject.set("fontSize", size);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [canvasRef]);

  const duplicateSelected = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const cloned = await activeObject.clone();
    cloned.set({
      left: (activeObject.left || 0) + 20,
      top: (activeObject.top || 0) + 20,
    });
    (cloned as any).customId =
      `${activeObject instanceof Textbox ? "text" : "img"}-${Date.now()}`;

    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
  }, [canvasRef]);

  const bringToFront = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.bringObjectToFront(activeObject);
    canvas.requestRenderAll();
  }, [canvasRef]);

  const sendToBack = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.sendObjectToBack(activeObject);
    canvas.requestRenderAll();
  }, [canvasRef]);

  const bringForward = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.bringObjectForward(activeObject);
    canvas.requestRenderAll();
  }, [canvasRef]);

  const sendBackward = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    canvas.sendObjectBackwards(activeObject);
    canvas.requestRenderAll();
  }, [canvasRef]);

  const toJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toObject(["customId"]);
  }, [canvasRef]);

  const loadFromJSON = useCallback(
    async (json: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      await canvas.loadFromJSON(json);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const toDataURL = useCallback(
    (format: "png" | "jpeg" = "png", quality = 1) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const currentZoom = canvas.getZoom();
      canvas.setZoom(1);
      canvas.setDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

      const dataURL = canvas.toDataURL({
        format: format,
        quality: quality,
        multiplier: 4,
      });

      canvas.setZoom(currentZoom);
      canvas.setDimensions({
        width: CANVAS_WIDTH * currentZoom,
        height: CANVAS_HEIGHT * currentZoom,
      });

      return dataURL;
    },
    [canvasRef],
  );

  const updateBackground = useCallback(
    (color: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (color.includes("gradient")) {
        let gradient: any = null;

        if (color.includes("linear-gradient")) {
          const isDiagonal = color.includes("120deg");
          const isTop = color.includes("to top");

          let coords = { x1: 0, y1: 0, x2: 1, y2: 0 };
          if (isDiagonal) coords = { x1: 0, y1: 0, x2: 1, y2: 1 };
          if (isTop) coords = { x1: 0, y1: 1, x2: 0, y2: 0 };

          const colors = color.match(/#[a-fA-F0-9]{6}/g) || [
            "#ffffff",
            "#000000",
          ];

          gradient = new Gradient({
            type: "linear",
            coords: {
              x1: coords.x1 * CANVAS_WIDTH,
              y1: coords.y1 * CANVAS_HEIGHT,
              x2: coords.x2 * CANVAS_WIDTH,
              y2: coords.y2 * CANVAS_HEIGHT,
            },
            colorStops: [
              { offset: 0, color: colors[0] },
              { offset: 1, color: colors[1] },
            ],
          });
        } else if (color.includes("radial-gradient")) {
          const colors = color.match(/#[a-fA-F0-9]{6}/g) || [
            "#ffffff",
            "#000000",
          ];
          gradient = new Gradient({
            type: "radial",
            coords: {
              x1: CANVAS_WIDTH / 2,
              y1: CANVAS_HEIGHT / 2,
              r1: 0,
              x2: CANVAS_WIDTH / 2,
              y2: CANVAS_HEIGHT / 2,
              r2: CANVAS_WIDTH / 1.5,
            },
            colorStops: [
              { offset: 0, color: colors[0] },
              { offset: 1, color: colors[1] },
            ],
          });
        }

        if (gradient) {
          const bgRect = canvas
            .getObjects()
            .find((obj: any) => obj.customId === "background-rect");
          if (bgRect) {
            bgRect.set({ fill: gradient });
          } else {
            const rect = new Rect({
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              fill: gradient,
              selectable: false,
              evented: false,
            });
            (rect as any).customId = "background-rect";
            canvas.add(rect);
            canvas.sendObjectToBack(rect);
          }
        }
      } else {
        const bgRect = canvas
          .getObjects()
          .find((obj: any) => obj.customId === "background-rect");
        if (bgRect) {
          bgRect.set({ fill: color });
          if (bgRect.type === "image") {
            canvas.remove(bgRect);
            const rect = new Rect({
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              fill: color,
              selectable: false,
              evented: false,
            });
            (rect as any).customId = "background-rect";
            canvas.add(rect);
            canvas.sendObjectToBack(rect);
          }
        } else {
          const rect = new Rect({
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            fill: color,
            selectable: false,
            evented: false,
          });
          (rect as any).customId = "background-rect";
          canvas.add(rect);
          canvas.sendObjectToBack(rect);
        }
      }

      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const updateBackgroundImage = useCallback(
    async (src: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const img = await FabricImage.fromURL(src, {
          crossOrigin: "anonymous",
        });

        const scaleX = CANVAS_WIDTH / img.width!;
        const scaleY = CANVAS_HEIGHT / img.height!;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          originX: "center",
          originY: "center",
          left: CANVAS_WIDTH / 2,
          top: CANVAS_HEIGHT / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        (img as any).customId = "background-rect";

        const oldBg = canvas
          .getObjects()
          .find((obj: any) => obj.customId === "background-rect");
        if (oldBg) canvas.remove(oldBg);

        canvas.add(img);
        canvas.sendObjectToBack(img);

        canvas.requestRenderAll();
      } catch (err) {
        console.error("Failed to set background image", err);
      }
    },
    [canvasRef],
  );

  const updateBackgroundStyle = useCallback(
    (style: { opacity?: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const bgObject = canvas
        .getObjects()
        .find((obj: any) => obj.customId === "background-rect");
      if (bgObject) {
        if (style.opacity !== undefined) {
          bgObject.set({ opacity: style.opacity });
        }
        canvas.requestRenderAll();
      }
    },
    [canvasRef],
  );

  const updateTheme = useCallback(
    (colors: string[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      updateBackground(colors[0]);

      canvas.getObjects().forEach((obj) => {
        const id = (obj as any).customId || "";

        if (id === "title" || id.includes("price")) {
          obj.set({ fill: colors[1] });
          if (obj.shadow) {
            (obj.shadow as Shadow).color = colors[1] + "40";
          }
        } else if (id === "subtitle" || id === "subhead") {
          obj.set({ fill: colors[2] });
        } else if (id.includes("desc") || id === "body") {
          obj.set({ fill: colors[3] || colors[1] });
        } else if (obj.type === "i-text" || obj.type === "textbox") {
          if (!id) obj.set({ fill: colors[1] });
        }
      });

      canvas.requestRenderAll();
    },
    [canvasRef, updateBackground],
  );

  const createPatternCanvas = (type: "grain" | "paper") => {
    if (typeof document === "undefined") return null;

    const size = 100;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (type === "grain") {
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 200;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 40;
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (type === "paper") {
      ctx.fillStyle = "#fffdf5";
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "#a8a29e";
      ctx.lineWidth = 1;

      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        const x = Math.random() * size;
        const y = Math.random() * size;
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + (Math.random() - 0.5) * 10,
          y + (Math.random() - 0.5) * 10,
        );
        ctx.globalAlpha = 0.1;
        ctx.stroke();
      }
    }

    return canvas;
  };

  const updateTexture = useCallback(
    (textureType: "none" | "grain" | "paper") => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const objects = canvas.getObjects();
      const existingTexture = objects.find(
        (obj) => (obj as any).customId === "texture-overlay",
      );
      if (existingTexture) {
        canvas.remove(existingTexture);
      }

      if (textureType === "none") {
        canvas.requestRenderAll();
        return;
      }

      const patternSource = createPatternCanvas(textureType);
      if (!patternSource) return;

      const pattern = new Pattern({
        source: patternSource,
        repeat: "repeat",
      });

      const rect = new Rect({
        left: 0,
        top: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        fill: pattern,
        selectable: false,
        evented: false,
        opacity: textureType === "grain" ? 0.15 : 0.5,
        globalCompositeOperation: "multiply",
      });

      (rect as any).customId = "texture-overlay";

      canvas.add(rect);
      canvas.bringObjectToFront(rect);
      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  const updateLayout = useCallback(
    (layoutId: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const objects = canvas.getObjects();
      const title = objects.find((o) => (o as any).customId === "title");
      const subtitle = objects.find((o) => (o as any).customId === "subtitle");

      const itemGroups: Record<
        string,
        { title?: FabricObject; price?: FabricObject; desc?: FabricObject }
      > = {};

      objects.forEach((obj) => {
        const id = (obj as any).customId || "";
        if (id.startsWith("item-")) {
          const parts = id.split("-");
          const index = parts[1];
          const type = parts[2];
          if (!itemGroups[index]) itemGroups[index] = {};
          if (type === "title") itemGroups[index].title = obj;
          if (type === "price") itemGroups[index].price = obj;
          if (type === "desc") itemGroups[index].desc = obj;
        }
      });

      const centerX = CANVAS_WIDTH / 2;

      if (layoutId === "classic") {
        if (title) {
          title.set({
            left: centerX,
            top: 60,
            originX: "center",
            textAlign: "center",
            fontSize: 64,
            fontFamily: "Bebas Neue",
            width: CANVAS_WIDTH - 100,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: centerX,
            top: 130,
            originX: "center",
            textAlign: "center",
            fontSize: 16,
            fontFamily: "Manrope",
            width: 400,
          });
        }

        let yPos = 180;
        Object.values(itemGroups).forEach((group) => {
          if (group.title)
            group.title.set({
              left: centerX,
              top: yPos,
              originX: "center",
              textAlign: "center",
              fontSize: 22,
              width: 400,
            });
          if (group.price)
            group.price.set({
              left: centerX,
              top: yPos + 30,
              originX: "center",
              textAlign: "center",
              fontSize: 18,
              fill: "#d9f99d",
            });
          if (group.desc) {
            group.desc.set({
              left: centerX,
              top: yPos + 55,
              originX: "center",
              textAlign: "center",
              width: 400,
              fontSize: 12,
              visible: true,
            });
          }
          yPos += 105;
        });
      } else if (layoutId === "modern") {
        const leftMargin = 40;
        if (title) {
          title.set({
            left: leftMargin,
            top: 40,
            originX: "left",
            textAlign: "left",
            fontSize: 60,
            fontFamily: "Oswald",
            width: 500,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: leftMargin + 2,
            top: 110,
            originX: "left",
            textAlign: "left",
            fontSize: 14,
            fontFamily: "Manrope",
            width: 300,
          });
        }

        let yPos = 160;
        Object.values(itemGroups).forEach((group) => {
          if (group.title)
            group.title.set({
              left: leftMargin,
              top: yPos,
              originX: "left",
              textAlign: "left",
              fontSize: 20,
              fontFamily: "Manrope",
              fontWeight: "bold",
              width: 350,
            });
          if (group.price)
            group.price.set({
              left: CANVAS_WIDTH - 40,
              top: yPos,
              originX: "right",
              textAlign: "right",
              fontSize: 20,
              fill: "#ffffff",
            });

          if (group.desc) {
            group.desc.set({
              left: leftMargin,
              top: yPos + 28,
              originX: "left",
              textAlign: "left",
              width: 450,
              fontSize: 12,
              visible: true,
              fill: "#a3a3a3",
            });
          }
          yPos += 95;
        });
      } else if (layoutId === "bistro") {
        if (title) {
          title.set({
            left: centerX,
            top: 40,
            originX: "center",
            textAlign: "center",
            fontSize: 72,
            fontFamily: "Lobster",
            fill: "#fbbf24",
            width: CANVAS_WIDTH - 60,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: centerX,
            top: 120,
            originX: "center",
            textAlign: "center",
            fontSize: 18,
            fontFamily: "Abril Fatface",
            fill: "#fff",
          });
        }

        let yPos = 170;
        Object.values(itemGroups).forEach((group) => {
          if (group.title)
            group.title.set({
              left: centerX,
              top: yPos,
              originX: "center",
              textAlign: "center",
              fontSize: 24,
              fontFamily: "Playfair Display",
              width: 400,
            });
          if (group.price)
            group.price.set({
              left: centerX,
              top: yPos + 30,
              originX: "center",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "normal",
              fill: "#fbbf24",
            });
          if (group.desc)
            group.desc?.set({
              left: centerX,
              top: yPos + 55,
              originX: "center",
              textAlign: "center",
              width: 350,
              fontStyle: "italic",
              fontSize: 12,
            });
          yPos += 100;
        });
      } else if (layoutId === "minimal") {
        if (title) {
          title.set({
            left: 30,
            top: 30,
            originX: "left",
            textAlign: "left",
            fontSize: 42,
            fontFamily: "Inter",
            fontWeight: "100",
            width: 400,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: 30,
            top: 80,
            originX: "left",
            textAlign: "left",
            fontSize: 12,
            fontFamily: "Inter",
            fill: "#888",
          });
        }

        let yPos = 140;
        Object.values(itemGroups).forEach((group) => {
          if (group.title)
            group.title.set({
              left: 30,
              top: yPos,
              originX: "left",
              textAlign: "left",
              fontSize: 16,
              fontFamily: "Inter",
              fontWeight: "600",
              width: 300,
            });
          if (group.price)
            group.price.set({
              left: 350,
              top: yPos,
              originX: "left",
              textAlign: "left",
              fontSize: 16,
              fontFamily: "Inter",
              fill: "#fff",
            });
          if (group.desc)
            group.desc?.set({
              left: 30,
              top: yPos + 22,
              originX: "left",
              textAlign: "left",
              width: 300,
              fontSize: 10,
              fill: "#666",
            });
          yPos += 75;
        });
      } else if (layoutId === "magazine") {
        if (title) {
          title.set({
            left: 30,
            top: 40,
            originX: "left",
            textAlign: "left",
            fontSize: 60,
            fontFamily: "Bodoni Moda",
            width: 250,
            lineHeight: 1.0,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: 30,
            top: 250,
            originX: "left",
            textAlign: "left",
            fontSize: 14,
            width: 200,
            fontStyle: "italic",
          });
        }

        let yPos = 40;
        const rightColX = 300;
        Object.values(itemGroups).forEach((group) => {
          if (group.title)
            group.title.set({
              left: rightColX,
              top: yPos,
              originX: "left",
              textAlign: "left",
              fontSize: 20,
              fontFamily: "Manrope",
              fontWeight: "bold",
              width: 250,
            });
          if (group.price)
            group.price.set({
              left: CANVAS_WIDTH - 30,
              top: yPos,
              originX: "right",
              textAlign: "right",
              fontSize: 20,
            });
          if (group.desc)
            group.desc?.set({
              left: rightColX,
              top: yPos + 25,
              originX: "left",
              textAlign: "left",
              width: 250,
              fontSize: 11,
              lineHeight: 1.3,
            });
          yPos += 85;
        });
      } else if (layoutId === "sales") {
        if (title) {
          title.set({
            left: centerX,
            top: 40,
            originX: "center",
            textAlign: "center",
            fontSize: 64,
            fontWeight: "900",
            fill: "#ef4444",
            fontFamily: "Inter",
            width: CANVAS_WIDTH - 40,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: centerX,
            top: 120,
            originX: "center",
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
            fill: "#000",
            backgroundColor: "#facc15",
          });
        }

        let yPos = 180;
        Object.values(itemGroups).forEach((group) => {
          if (group.title)
            group.title.set({
              left: 40,
              top: yPos,
              originX: "left",
              textAlign: "left",
              fontSize: 26,
              fontWeight: "bold",
              width: 350,
            });
          if (group.price)
            group.price.set({
              left: CANVAS_WIDTH - 40,
              top: yPos,
              originX: "right",
              textAlign: "right",
              fontSize: 36,
              fill: "#ef4444",
              fontWeight: "bold",
            });
          if (group.desc) group.desc?.set({ visible: false });
          yPos += 100;
        });
      } else if (layoutId === "grid") {
        if (title) {
          title.set({
            left: centerX,
            top: 40,
            originX: "center",
            textAlign: "center",
            fontSize: 52,
            width: CANVAS_WIDTH - 100,
          });
        }
        if (subtitle) {
          subtitle.set({
            left: centerX,
            top: 100,
            originX: "center",
            textAlign: "center",
            fontSize: 18,
          });
        }

        const col1X = CANVAS_WIDTH * 0.25;
        const col2X = CANVAS_WIDTH * 0.75;
        let currentY = 160;

        Object.values(itemGroups).forEach((group, index) => {
          const isLeft = index % 2 === 0;
          const xPos = isLeft ? col1X : col2X;
          const rowY = currentY + Math.floor(index / 2) * 160;

          if (group.title)
            group.title.set({
              left: xPos,
              top: rowY,
              originX: "center",
              textAlign: "center",
              fontSize: 18,
              fontWeight: "bold",
              width: 220,
            });
          if (group.price)
            group.price.set({
              left: xPos,
              top: rowY + 30,
              originX: "center",
              textAlign: "center",
              fontSize: 16,
              fill: "#84cc16",
            });
          if (group.desc)
            group.desc?.set({
              left: xPos,
              top: rowY + 55,
              originX: "center",
              textAlign: "center",
              width: 200,
              fontSize: 11,
              visible: true,
            });
        });
      }

      canvas.requestRenderAll();
    },
    [canvasRef],
  );

  return {
    addText,
    addImage,
    updateFontFamily,
    updateTextAlign,
    updateFillColor,
    updateFontSize,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    toJSON,
    loadFromJSON,
    toDataURL,
    updateTexture,
    updateTheme,
    updateLayout,
    updateBackground,
    updateBackgroundImage,
    updateBackgroundStyle,
  };
}
