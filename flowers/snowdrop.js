const FLOWER_ASSETS = {
    snowdrop: {
        anchor: { x: 4, y: 5 },
        grid: [
            [0, 0, 0, 1, 0, 0, 0, 0],
            [0, 0, 2, 0, 1, 0, 0, 0],
            [0, 3, 3, 0, 1, 0, 0, 0],
            [0, 3, 3, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0],
        ],
        palette: {
            1: '#567c2e',
            2: '#69a1ba',
            3: '#c7eefa',
        },
    },
    snowdropStage1: {
        anchor: { x: 1, y: 2 },
        grid: [
            [0, 1, 0],
            [1, 1, 0],
            [2, 2, 2],
        ],
        palette: {
            1: '#8dcf45',
            2: '#567c2e',
        },
    },
};

window.FLOWER_ASSETS = FLOWER_ASSETS;
