/**
 * This file allows to specify custom fieldExpansionDepth values for specific queries and mutations.
 * The default value from spectaql-config.yml will be used for any query/mutation not listed here.
 *
 * Format:
 * {
 *   queries: {
 *     'queryName': depth,
 *     ...
 *   },
 *   mutations: {
 *     'mutationName': depth,
 *     ...
 *   }
 * }
 */
module.exports = {
    queries: {
        roomAccessKeys: 6,
        settings: 4,
        inventory: 4,
    },
    mutations: {
        updateCategoryPrices: 5,
        updateReservation: 2,
        updateRoomStay: 2,
        updateRoomSetup: 2,
        addRoomStayGuest: 2,
        removeRoomStayGuest: 2,
        createRoomAccessKey: 5,
        addRoomAccessKey: 2,
        removeRoomAccessKey: 2,
    },
}
