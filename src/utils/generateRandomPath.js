function generateRandomPath(count = 12) {
    const locations = Array.from({ length: count }, (_, i) => i + 1);
    let shuffledLocations = [...locations];

    // Shuffle the locations array
    for (let i = shuffledLocations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledLocations[i], shuffledLocations[j]] = [shuffledLocations[j], shuffledLocations[i]];
    }

    return shuffledLocations;
}

export default generateRandomPath;