const axios = require('axios');

/**
 * @author Vitor Ferreira Garcia <vitfgarcia@gmail.com>
 * @description Function that makes http request with failsafe
 *              for internal server errors
 * @param {String} url 
 */
async function MakeRequest(url) {
    try {
        return await axios.get(url, { responseType: 'stream' });
    } catch (err) {
        if (err && err.response && err.response.status === 500) {
            return MakeRequest(url);
        }
    }
}

module.exports = {
    MakeRequest,
};
