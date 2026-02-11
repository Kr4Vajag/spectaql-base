module.exports = function (options) {
    const { servers } = options?.data?.root || {}

    return servers
        .map(
            (server) =>
                server.description.trim() +
                ':\n' +
                server.url.trim() +
                (server === servers[servers.length - 1] ? '' : '\n​\n')
        )
        .join('')
}
