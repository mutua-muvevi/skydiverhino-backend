/**
 * Enhanced Compression Configuration for Express applications:
 * 
 * - Filter: Determines if the response should be compressed or not.
 * - Level: Sets compression level. Ranges from 1 (fastest, least compression) to 9 (slowest, maximum compression).
 * - Threshold: Sets a byte threshold for the response body size before compression is considered.
 * - WindowBits, MemLevel, Strategy: Fine-tune how the compression algorithms work. 
 * 
 * This configuration is designed to optimize the balance between compression efficiency and performance.
 * Remember that while compression reduces the response payload, 
 * it does add some processing overhead for the server and client.
 */
const compression = require('compression');

const compressionConfig = compression({
    filter: (req, res) => {
        // By default, it compresses responses with `compressible` content types.
        // You can add more logic here if needed.
        if (req.headers['x-no-compression']) {
            return false;  // Don't compress responses with this header.
        }
        return compression.filter(req, res);  // Use default filter method
    },
    level: 6,  // A good balance of speed and compression efficiency
    threshold: 1024,  // Don't compress responses less than this byte size
    windowBits: 15,  // Controls the trade-off between memory usage and compression ratio. The default value of 15 is typically a good choice.
    memLevel: 8,  // Controls the trade-off between memory usage and compression ratio. The default value of 8 is typically a good choice.
    strategy: compression.Z_DEFAULT_STRATEGY  // The default compression strategy is typically good for most use cases.
});

module.exports = compressionConfig;