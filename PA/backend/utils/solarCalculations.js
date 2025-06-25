
function calculateSolarMetrics(totalProduced, totalConsumed) {
    const KWH_PRICE = 0.75; // Exemplo: R$ 0,75 por kWh
    const TREES_SAVED_FACTOR = 0.02; // Exemplo: árvores salvas por kWh produzido

    // Garantir que os inputs são números
    const produced = Number(totalProduced) || 0;
    const consumed = Number(totalConsumed) || 0;

    const energySaved = Math.max(0, produced - consumed);
    const moneySaved = energySaved * KWH_PRICE;
    // Árvores salvas geralmente são calculadas com base na energia *produzida* (evitando emissões)
    const treesSaved = produced * TREES_SAVED_FACTOR;

    return {
        energySaved: parseFloat(energySaved.toFixed(2)),
        moneySaved: parseFloat(moneySaved.toFixed(2)),
        treesSaved: parseFloat(treesSaved.toFixed(1))
    };
}

module.exports = { calculateSolarMetrics };
