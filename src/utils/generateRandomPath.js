function generateRandomPath() {
    const locations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];  // Your 12 locations
    let shuffledLocations = [...locations];

    // Shuffle the locations array
    for (let i = shuffledLocations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledLocations[i], shuffledLocations[j]] = [shuffledLocations[j], shuffledLocations[i]];
    }

    return shuffledLocations;
}

export default generateRandomPath;