function createFlowerSystem() {
    const flowers = [];
    const stages = [
        { name: 'sprout', duration: 2 },
        { name: 'half-grown', duration: 3 },
        { name: 'full-bloom', duration: 3 },
        { name: 'decay', duration: 2 },
    ];

    function initForBurrows(count) {
        flowers.length = 0;
        for (let i = 0; i < count; i++) {
            flowers.push(createGenericFlower(i));
        }
    }

    function addForBurrow(burrowIndex) {
        flowers.push(createGenericFlower(burrowIndex));
    }

    function updateAll() {
        for (let i = flowers.length - 1; i >= 0; i--) {
            const flower = flowers[i];
            if (!flower.alive) {
                flowers.splice(i, 1);
                continue;
            }
            flower.age += 1;
            advanceStageIfNeeded(flower);
        }
    }

    function getFlowers() {
        return flowers;
    }

    function createGenericFlower(burrowIndex) {
        return {
            type: 'generic',
            burrowIndex,
            age: 0,
            stageIndex: 0,
            alive: true,
        };
    }

    function advanceStageIfNeeded(flower) {
        if (!flower.alive) return;
        const stage = stages[flower.stageIndex];
        if (flower.age < stage.duration) return;

        flower.age = 0;
        flower.stageIndex += 1;

        if (flower.stageIndex >= stages.length) {
            flower.alive = false;
        }
    }

    return {
        initForBurrows,
        addForBurrow,
        updateAll,
        getFlowers,
    };
}

window.createFlowerSystem = createFlowerSystem;
