export function createFlowerSystem() {
    const flowers = [];
    const flowerTypes = {
        snowdrop: {
            season: 'Spring',
            lastPossibleDay: 10,
            stages: [
                { name: 'stage1', duration: 3, asset: 'snowdropStage1' },
                { name: 'stage2', duration: 5, asset: 'snowdrop' },
            ],
        },
        redTulip: {
            season: 'Spring',
            lastPossibleDay: 30,
            stages: [
                { name: 'stage1', duration: 5, asset: 'tulipStage1' },
            ],
        },
        yellowTulip: {
            season: 'Spring',
            lastPossibleDay: 30,
            stages: [
                { name: 'stage1', duration: 10, asset: 'tulipStage1Yellow' },
            ],
        },
        poppy: {
            season: 'Summer',
            lastPossibleDay: 30,
            stages: [
                { name: 'stage1', duration: 3, asset: 'poppyStage1' },
            ],
        },
    };

    function initForBurrows(count, type = 'snowdrop') {
        flowers.length = 0;
        for (let i = 0; i < count; i++) {
            flowers.push(createGenericFlower(i, type));
        }
    }

    function plantRandom(burrowCount, type = 'snowdrop', min = 1, max = 3) {
        if (burrowCount <= 0) return;
        const count = min + Math.floor(Math.random() * (max - min + 1));
        let attempts = 0;
        const maxAttempts = Math.max(count * 5, 10);
        for (let i = 0; i < count; i++) {
            if (attempts >= maxAttempts) break;
            const burrowIndex = Math.floor(Math.random() * burrowCount);
            attempts += 1;
            if (hasActiveFlowerAtBurrow(burrowIndex)) {
                i -= 1;
                continue;
            }
            flowers.push(createGenericFlower(burrowIndex, type));
        }
    }

    function addForBurrow(burrowIndex, type = 'snowdrop') {
        if (hasActiveFlowerAtBurrow(burrowIndex)) return;
        flowers.push(createGenericFlower(burrowIndex, type));
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

    function pruneToSeason(seasonName) {
        for (let i = flowers.length - 1; i >= 0; i--) {
            const flower = flowers[i];
            if (flower.season !== seasonName) {
                flowers.splice(i, 1);
            }
        }
    }

    function getFlowers() {
        return flowers;
    }

    function getFlowerDefinition(type) {
        return flowerTypes[type];
    }

    function createGenericFlower(burrowIndex, type) {
        const definition = flowerTypes[type] || {};
        const stageDefinition = definition.stages?.[0] || {};
        const stageAsset = pickStageAsset(stageDefinition);
        return {
            type,
            season: definition.season || 'Spring',
            asset: stageAsset,
            burrowIndex,
            age: 0,
            stageIndex: 0,
            alive: true,
        };
    }

    function advanceStageIfNeeded(flower) {
        if (!flower.alive) return;
        const definition = flowerTypes[flower.type];
        const stages = definition?.stages || [];
        const stage = stages[flower.stageIndex];
        if (flower.age < stage.duration) return;

        flower.age = 0;
        flower.stageIndex += 1;

        if (flower.stageIndex >= stages.length) {
            flower.alive = false;
            flower.asset = null;
            return;
        }
        flower.asset = pickStageAsset(stages[flower.stageIndex]) || flower.asset;
    }

    function pickStageAsset(stage) {
        if (!stage) return null;
        return stage.asset || null;
    }

    function hasActiveFlowerAtBurrow(burrowIndex) {
        return flowers.some(flower => flower.alive && flower.burrowIndex === burrowIndex);
    }

    return {
        initForBurrows,
        plantRandom,
        addForBurrow,
        updateAll,
        getFlowers,
        pruneToSeason,
        hasActiveFlowerAtBurrow,
        getFlowerDefinition,
    };
}
