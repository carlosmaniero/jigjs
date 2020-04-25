module.exports = {
    assetPrefix: 'http://localhost:3000/',
    pageExtensions: ["page.tsx", "bff.ts"],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.node = {
                fs: 'empty'
            }
        }
        return config
    }
}
