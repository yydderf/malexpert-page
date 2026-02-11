export const GRAPH = {
    DEFAULT: {
        NODE_STROKE_WIDTH: 1.5,
        NODE_STROKE_OPACITY: 1,
        NODE_RADIUS: 5,
        LINK_STROKE_OPACITY: 0.6,
        LINK_STROKE_WIDTH: 1.5,
        WIDTH: 640,
        HEIGHT: 400,
    },
    OBJ: {
        TRANS: {
            OVER_DURATION: 100,
            OUT_DURATION: 100,
        },
        POS: {
            X_OFFSET: 20,
            Y_OFFSET: -25,
        },
        FONT: {
            SIZE: 12,
        },
        BG: {
            X_OFFSET: 4,
            Y_OFFSET: 3,
        },
    },
    DRAG: {
        MAGNIFICATION: 2,
    },
} as const;
