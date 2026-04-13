try {
    console.log("Attempting to require documentParser...");
    const parser = require('./src/utils/documentParser');
    console.log("Successfully required documentParser");
} catch (error) {
    console.error("Error requiring documentParser:", error);
}
